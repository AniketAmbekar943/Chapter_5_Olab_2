"""Independent binary, geometry, hierarchy and metadata validation; Python stdlib."""
import argparse,hashlib,json,math,pathlib,struct

def load(path):
    data=path.read_bytes();magic,version,total=struct.unpack_from('<III',data)
    assert magic==0x46546C67 and version==2 and total==len(data)
    size,kind=struct.unpack_from('<II',data,12);assert kind==0x4E4F534A and size%4==0
    gltf=json.loads(data[20:20+size]);size2,kind2=struct.unpack_from('<II',data,20+size);assert kind2==0x004E4942 and 28+size+size2==len(data)
    return gltf,data[28+size:],data

def accessor(g,b,i):
    a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];dim={'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']];fmt={5126:'f',5125:'I'}[a['componentType']]
    offset=v.get('byteOffset',0)+a.get('byteOffset',0);step=dim*4;assert offset+a['count']*step<=v.get('byteOffset',0)+v['byteLength']<=len(b)
    values=list(struct.iter_unpack('<'+fmt*dim,b[offset:offset+a['count']*step]));return values

def main():
    p=argparse.ArgumentParser();p.add_argument('--output',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1]);out=p.parse_args().output
    manifests={n:json.loads((out/n).read_text(encoding='utf8')) for n in ['asset_manifest.json','model_hierarchy.json','animation_manifest.json']};report={'structural_checks':[],'visual_review_performed':False,'atomic_scientific_validation_performed':False}
    for entry in manifests['asset_manifest.json']['assets']:
        file=entry['filename'];g,b,raw=load(out/file);assert len(raw)==entry['size_bytes'];assert hashlib.sha256(raw).hexdigest()==entry['sha256']
        assert len(b)>=g['buffers'][0]['byteLength']
        names=[n['name'] for n in g['nodes']];assert len(names)==len(set(names));assert [m['name'] for m in g['meshes']]==entry['meshes']
        parents={};triangles=0;degenerate=0;geometry_checked=set();normal_deviation=0
        for i,n in enumerate(g['nodes']):
            assert n['extras']['semantic_id']==n['name'],n['name']
            for c in n.get('children',[]):assert c not in parents;parents[c]=i
            if 'mesh'in n:
                mesh=g['meshes'][n['mesh']];assert mesh['name']==n['name']
                for prim in mesh['primitives']:
                    ix=[x[0] for x in accessor(g,b,prim['indices'])];triangles+=len(ix)//3
                    key=(prim['attributes']['POSITION'],prim['indices'])
                    if key in geometry_checked:continue
                    geometry_checked.add(key);verts=accessor(g,b,prim['attributes']['POSITION']);norms=accessor(g,b,prim['attributes']['NORMAL']);assert len(verts)==len(norms);assert all(0<=x<len(verts) for x in ix)
                    assert all(math.isfinite(x) for row in verts+norms for x in row)
                    for nrm in norms:normal_deviation=max(normal_deviation,abs(math.sqrt(sum(x*x for x in nrm))-1))
                    assert normal_deviation<.001
                    for k in range(0,len(ix),3):
                        va,vb,vc=[verts[x] for x in ix[k:k+3]];u=[vb[j]-va[j] for j in range(3)];v=[vc[j]-va[j] for j in range(3)];area=sum(x*x for x in [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]])
                        if area<1e-20:degenerate+=1
        assert triangles==entry['triangle_count_instanced']
        objects=[o for o in manifests['model_hierarchy.json']['objects'] if o['glb']==file];assert len(objects)==len(names)
        for o in objects:
            n=g['nodes'][o['node_index']];assert n['name']==o['node_name'];pid=parents.get(o['node_index']);assert o['parent_id']==(file+'/'+names[pid] if pid is not None else None)
            assert o['child_ids']==[file+'/'+names[i] for i in n.get('children',[])]
            assert o['mesh_name']==(g['meshes'][n['mesh']]['name'] if 'mesh'in n else None)
            for member in n['extras'].get('member_nodes',[]):assert member in names,member
        clips=g.get('animations',[]);assert [c['name'] for c in clips]==entry['animation_clips']
        for c in clips:
            meta=next(x for x in manifests['animation_manifest.json']['clips'] if x['glb']==file and x['name']==c['name']);ends=[]
            for channel,state in zip(c['channels'],meta['start_end_states']):
                s=c['samplers'][channel['sampler']];times=[x[0] for x in accessor(g,b,s['input'])];vals=accessor(g,b,s['output']);assert all(times[i]<times[i+1] for i in range(len(times)-1));assert times[0]==0;assert len(times)==len(vals);ends.append(times[-1]);assert names[channel['target']['node']]==state['node_name']
                for actual,expected in [(vals[0],state['start']),(vals[-1],state['end'])]:assert all(abs(x-y)<1e-5 for x,y in zip(actual,expected))
            assert abs(max(ends)-meta['duration_seconds'])<1e-5
        # Count base pairing and hydrogen-contact semantics at each regular DNA pair.
        pairs=0
        for n in g['nodes']:
            if 'base_pair'in n['extras']:
                bp=n['extras']['base_pair'];assert bp in ['AT','TA','GC','CG'];hb=[names[c] for c in n.get('children',[]) if '_hydrogen_bond_'in names[c] and 'replacement'not in names[c]];assert len(hb)==(2 if bp in ['AT','TA'] else 3);pairs+=1
        result={'filename':file,'valid_glb_container':True,'accessors_in_bounds':True,'finite_geometry_and_unit_normals':True,'names_and_hierarchy_match':True,'animation_metadata_matches':True,'canonical_base_pairs_checked':pairs,'triangles':triangles,'unique_geometry_buffers_checked':len(geometry_checked),'degenerate_triangles':degenerate,'max_normal_length_error':normal_deviation};report['structural_checks'].append(result);print(file,'PASS',len(names),'nodes,',pairs,'base pairs,',degenerate,'degenerate triangles')
    runtime=out/'runtime_validation.json'
    if runtime.exists():
        report['runtime_validation']=json.loads(runtime.read_text());assert all(a['khronos_errors']==0 for a in report['runtime_validation']['assets']);assert all(c['entire_bounding_box_fits'] for a in report['runtime_validation']['assets'] for c in a['cameras'])
    else:report['runtime_validation']='Not run. No official validator or Three.js compatibility claim.'
    report['result']='PASS';(out/'validation_report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')

if __name__=='__main__':main()
