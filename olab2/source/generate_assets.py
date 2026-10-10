"""OLAB 2 procedural GLB authoring. Python 3.10+, standard library only.
Run: python source/generate_assets.py --output .
No downloaded geometry, external textures, or Blender installation required.
All geometry is an educational reconstruction, not experimental atomic coordinates.
"""
from __future__ import annotations
import argparse, array, hashlib, json, math, pathlib, struct, sys

PI = math.pi
def add(a,b): return tuple(x+y for x,y in zip(a,b))
def sub(a,b): return tuple(x-y for x,y in zip(a,b))
def mul(a,s): return tuple(x*s for x in a)
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def length(a): return math.sqrt(dot(a,a))
def unit(a): return mul(a,1/max(length(a),1e-12))
def qy(t): return [0,math.sin(t/2),0,math.cos(t/2)]
def rotate(q,v):
    t=mul(cross(q[:3],v),2)
    return add(v,add(mul(t,q[3]),cross(q[:3],t)))
def lerp(a,b,t): return add(mul(a,1-t),mul(b,t))

class Geometry:
    def __init__(self): self.p=[]; self.n=[]; self.i=[]
    def append(self,g,offset=(0,0,0),scale=(1,1,1)):
        k=len(self.p)
        self.p.extend([add(tuple(v[j]*scale[j] for j in range(3)),offset) for v in g.p])
        self.n.extend([unit(tuple(v[j]/scale[j] for j in range(3))) for v in g.n])
        self.i.extend([i+k for i in g.i]); return self

def ellipsoid(nu=40,nv=24,rough=0,cut=False):
    g=Geometry()
    # Polar axis y; cutaway retains the back hemisphere (negative z).
    for j in range(nv+1):
        t=PI*j/nv
        for i in range(nu+1):
            p=(PI+PI*i/nu) if cut else 2*PI*i/nu
            d=(math.sin(t)*math.cos(p),math.cos(t),math.sin(t)*math.sin(p))
            f=1+rough*(.45*math.sin(7*p+2*t)*math.sin(5*t)**2+.3*math.sin(13*p-3*t)*math.sin(t)**2+.25*math.cos(17*t+3*p)*math.sin(t)**2)
            g.p.append(mul(d,f)); g.n.append(d)
    for j in range(nv):
        for i in range(nu):
            a=j*(nu+1)+i; b=a+nu+1
            if j>0:g.i.extend([a,a+1,b])
            if j<nv-1:g.i.extend([a+1,b+1,b])
    if rough: recalc_normals(g)
    return g

def recalc_normals(g):
    ns=[[0.,0.,0.] for _ in g.p]
    for k in range(0,len(g.i),3):
        a,b,c=g.i[k:k+3]; n=cross(sub(g.p[b],g.p[a]),sub(g.p[c],g.p[a]))
        for idx in (a,b,c):
            for j in range(3):ns[idx][j]+=n[j]
    g.n=[unit(n) if length(n)>1e-10 else unit(p) for n,p in zip(ns,g.p)]

def tube(points,r=.05,sides=8,closed=False):
    pts=list(points)
    if closed:pts.append(pts[0])
    g=Geometry(); prev=None
    for j,p in enumerate(pts):
        tangent=unit(sub(pts[min(j+1,len(pts)-1)],pts[max(j-1,0)]))
        ref=(0,1,0) if abs(tangent[1])<.92 else (1,0,0)
        u=unit(cross(tangent,ref))
        if prev is not None and dot(prev,u)<0:u=mul(u,-1)
        v=unit(cross(tangent,u)); prev=u
        for i in range(sides):
            n=add(mul(u,math.cos(i*2*PI/sides)),mul(v,math.sin(i*2*PI/sides)))
            g.p.append(add(p,mul(n,r))); g.n.append(n)
    for j in range(len(pts)-1):
        for i in range(sides):
            a=j*sides+i;b=j*sides+(i+1)%sides;c=a+sides;d=b+sides
            g.i.extend([a,b,c,b,d,c])
    for j,sign in [(0,-1),(len(pts)-1,1)]:
        idx=len(g.p); tangent=unit(sub(pts[min(j+1,len(pts)-1)],pts[max(j-1,0)]))
        g.p.append(pts[j]);g.n.append(mul(tangent,sign))
        for i in range(sides):
            a=j*sides+i;b=j*sides+(i+1)%sides
            g.i.extend([idx,b,a] if sign<0 else [idx,a,b])
    return g

def ringplate(vertices,height=.025):
    # Shallow aromatic polygon, two planar faces and vertical edge faces.
    g=Geometry(); n=len(vertices)
    for y,ny in [(-height/2,-1),(height/2,1)]:
        for x,z in vertices:g.p.append((x,y,z));g.n.append((0,ny,0))
    for i in range(1,n-1):g.i.extend([0,i+1,i,n,n+i,n+i+1])
    for i in range(n):
        a=vertices[i];b=vertices[(i+1)%n];normal=unit((b[1]-a[1],0,a[0]-b[0]));k=len(g.p)
        g.p.extend([(a[0],-height/2,a[1]),(b[0],-height/2,b[1]),(b[0],height/2,b[1]),(a[0],height/2,a[1])]);g.n.extend([normal]*4)
        g.i.extend([k,k+1,k+2,k,k+2,k+3])
    return g

def base_geometry(letter):
    # Recognizable planar single/fused rings; a semantic base, not a chemical atom graph.
    g=Geometry(); centers=[(.38,0)]
    if letter in 'AG':centers=[(.28,0),(.48,0)]
    for j,(x,z) in enumerate(centers):
        n=5 if len(centers)==2 and j==0 else 6;radius=.145 if n==5 else .17
        polygon=[(x+radius*math.cos(2*PI*k/n),z+radius*math.sin(2*PI*k/n)) for k in range(n)]
        # Reversed polygon for y-up top winding.
        g.append(ringplate(list(reversed(polygon)),.032))
        g.append(tube([(a,0,b) for a,b in polygon],.018,6,True))
    g.append(tube([(0,0,0),(.18,0,0)],.022,6))
    # Edge substituent indications intentionally omit atom labels.
    for z in [-.10,.10]:g.append(tube([(.49,0,z),(.65,0,z)],.020,6))
    if letter=='T':g.append(tube([(.39,0,.16),(.42,0,.24)],.020,6))
    return g

COLORS={
 'membrane':(.61,.48,.36,1),'cytoplasm':(.70,.64,.49,1),'envelope':(.48,.48,.40,1),
 'nucleoplasm':(.56,.54,.45,1),'chromatin':(.45,.37,.31,1),'chromosome':(.53,.38,.30,1),
 'histone':(.69,.57,.40,1),'mitochondria':(.60,.31,.20,1),'cristae':(.85,.57,.34,1),
 'er':(.52,.56,.41,1),'strand_a':(.68,.59,.42,1),'strand_b':(.43,.53,.49,1),
 'sugar':(.77,.70,.53,1),'phosphate':(.69,.48,.28,1),
 'A':(.43,.56,.35,1),'T':(.65,.38,.29,1),'G':(.70,.57,.28,1),'C':(.36,.51,.59,1),
 'hydrogen':(.73,.77,.72,1),'phosphodiester':(.56,.47,.34,1),
 'polymerase':(.57,.48,.36,1),'rna':(.55,.62,.39,1),'ribosome':(.66,.56,.46,1),
 'ribosome_small':(.49,.52,.42,1),'trna':(.43,.57,.51,1),'protein':(.65,.43,.32,1),
 'oxygen':(.66,.33,.27,1),'nitrogen':(.37,.47,.55,1)
}
BASE_NAMES={'A':'adenine','T':'thymine','G':'guanine','C':'cytosine'}
COMP={'A':'T','T':'A','G':'C','C':'G'}

class Asset:
    def __init__(self,filename):
        self.filename=filename;self.bin=bytearray();self.geo={};self.parents={};self.concepts={};self.clips=[];self.levels=[];self.names={};self.mesh_tri={}
        self.g={'asset':{'version':'2.0','generator':'OLAB2 procedural scientific assets 1.0','copyright':'Generated for OLAB 2; original procedural geometry'},'scene':0,'scenes':[{'name':'OLAB2','nodes':[]}], 'nodes':[],'meshes':[],'materials':[], 'buffers':[],'bufferViews':[],'accessors':[],'animations':[]}
        self.mats={}
        for name,c in COLORS.items():
            self.mats[name]=len(self.g['materials']);self.g['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':list(c),'metallicFactor':0,'roughnessFactor':.69},'doubleSided':True})
    def access(self,data,typ,component=5126,target=None):
        while len(self.bin)%4:self.bin.append(0)
        n={'SCALAR':1,'VEC3':3,'VEC4':4}[typ]
        flat=list(data) if n==1 else [x for row in data for x in row]
        a=array.array('f' if component==5126 else 'I',flat)
        if sys.byteorder!='little':a.byteswap()
        raw=a.tobytes();bv={'buffer':0,'byteOffset':len(self.bin),'byteLength':len(raw)}
        if target:bv['target']=target
        v=len(self.g['bufferViews']);self.g['bufferViews'].append(bv);self.bin.extend(raw)
        idx=len(self.g['accessors']);acc={'bufferView':v,'componentType':component,'count':len(flat)//n,'type':typ}
        if component==5126:
            rows=[flat[i:i+n] for i in range(0,len(flat),n)]
            acc['min']=[min(r[j] for r in rows) for j in range(n)];acc['max']=[max(r[j] for r in rows) for j in range(n)]
        self.g['accessors'].append(acc);return idx
    def geometry(self,key,make):
        if key not in self.geo:
            geom=make() if callable(make) else make
            self.geo[key]=({'POSITION':self.access(geom.p,'VEC3',target=34962),'NORMAL':self.access(geom.n,'VEC3',target=34962)},self.access(geom.i,'SCALAR',5125,34963),len(geom.i)//3)
        return self.geo[key]
    def node(self,name,parent=None,mesh=None,mat=None,pos=(0,0,0),scale=(1,1,1),rot=None,concept='',select=True,extras=None):
        if name in self.names:raise ValueError('Duplicate node '+name)
        idx=len(self.g['nodes']);self.names[name]=idx
        n={'name':name,'translation':list(pos),'scale':list(scale),'extras':{'semantic_id':name,'selectable':select,'concept':concept}}
        if rot:n['rotation']=list(rot)
        if extras:n['extras'].update(extras)
        if mesh:
            at,ix,tris=mesh;mi=len(self.g['meshes']);n['mesh']=mi
            self.g['meshes'].append({'name':name,'primitives':[{'attributes':at,'indices':ix,'material':self.mats[mat],'mode':4}]});self.mesh_tri[mi]=tris
        self.g['nodes'].append(n);self.parents[idx]=parent
        if parent is None:self.g['scenes'][0]['nodes'].append(idx)
        else:self.g['nodes'][parent].setdefault('children',[]).append(idx)
        return idx
    def shape(self,name,parent,mat,pos=(0,0,0),scale=(1,1,1),rough=.05,cut=False,detail=32,concept=''):
        return self.node(name,parent,self.geometry(('surface',detail,rough,cut),lambda:ellipsoid(detail,detail//2,rough,cut)),mat,pos,scale,concept=concept)
    def pipe(self,name,parent,points,r,mat,concept='',sides=8):
        return self.node(name,parent,self.geometry(name,lambda:tube(points,r,sides)),mat,concept=concept)
    def clip(self,name,duration,tracks,purpose,prereq=None):
        samplers=[];channels=[];states=[]
        for node,path,times,values in tracks:
            sid=len(samplers);samplers.append({'input':self.access(times,'SCALAR'),'output':self.access(values,'VEC4' if path=='rotation' else 'VEC3'),'interpolation':'LINEAR'})
            channels.append({'sampler':sid,'target':{'node':node,'path':path}})
            states.append({'node_name':self.g['nodes'][node]['name'],'property':path,'start':list(values[0]),'end':list(values[-1])})
        self.g['animations'].append({'name':name,'samplers':samplers,'channels':channels})
        self.clips.append({'glb':self.filename,'name':name,'purpose':purpose,'duration_seconds':duration,'embedded':True,'interruptible':True,'resettable':True,'loop':False,'start_end_states':states,'prerequisites':prereq or ['Restore the rest transforms before playback.'],'reset':'Stop actions and restore saved rest transforms; do not run mutation clips concurrently.'})
    def level(self,id,root,target,camera,distance,concept,parent=None):
        self.levels.append({'id':id,'root_node':self.g['nodes'][root]['name'],'glb':self.filename,'camera_position':list(camera),'look_at':list(target),'distance':length(sub(camera,target)),'perspective_vertical_fov_degrees':38,'near':.01,'far':350,'educational_concept':concept,'parent_id':parent,'child_ids':[],'world_units':'illustrative stage units, not a shared biological length scale'})
        if parent:
            for l in self.levels:
                if l['id']==parent:l['child_ids'].append(id)
    def save(self,out):
        self.g['buffers']=[{'byteLength':len(self.bin)}]
        # Remove unused material entries, then remap primitives.
        used=sorted({p['material'] for m in self.g['meshes'] for p in m['primitives']});mapping={m:i for i,m in enumerate(used)}
        self.g['materials']=[self.g['materials'][i] for i in used]
        for m in self.g['meshes']:
            for p in m['primitives']:p['material']=mapping[p['material']]
        if not self.g['animations']:del self.g['animations']
        txt=json.dumps(self.g,separators=(',',':')).encode();txt+=b' '*((-len(txt))%4);binary=bytes(self.bin);binary+=b'\0'*((-len(binary))%4)
        body=struct.pack('<II',len(txt),0x4E4F534A)+txt+struct.pack('<II',len(binary),0x004E4942)+binary
        data=struct.pack('<III',0x46546C67,2,12+len(body))+body;(out/self.filename).write_bytes(data)
        return {'filename':self.filename,'path':self.filename,'size_bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'triangle_count_instanced':sum(self.mesh_tri[n['mesh']] for n in self.g['nodes'] if 'mesh'in n),'triangle_count_unique_geometry':sum(v[2] for v in self.geo.values()),'mesh_count':len(self.g['meshes']),'node_count':len(self.g['nodes']),'texture_sizes':[],'textures':0,'materials':len(self.g['materials']),'meshes':[m['name'] for m in self.g['meshes']],'animation_clips':[x['name'] for x in self.g.get('animations',[])],'required_extensions':[]}

def sugar_geom():
    pts=[(.13*math.cos(2*PI*i/5),.035*math.sin(4*PI*i/5),.13*math.sin(2*PI*i/5)) for i in range(5)]
    g=tube(pts,.025,6,True);g.append(tube([pts[0],(.23,.05,0)],.022,6));return g

def phosphate_geom():
    g=Geometry().append(ellipsoid(12,8),scale=(.060,.060,.060))
    for d in [(1,1,1),(-1,-1,1),(-1,1,-1),(1,-1,-1)]:
        p=mul(unit(d),.105);g.append(tube([(0,0,0),p],.016,6));g.append(ellipsoid(8,6),p,(.034,.034,.034))
    return g

def dna(a,parent,prefix,sequence,scale=1,mutation=False):
    root=a.node(prefix,parent,scale=(scale,scale,scale),concept='Right-handed B-DNA, approximately 10.5 base pairs per turn; illustrative rings, not atomic coordinates.',extras={'sequence_a_5_to_3':sequence,'strand_a_direction':"5prime at lower y, 3prime at upper y",'strand_b_direction':"3prime at lower y, 5prime at upper y",'base_pair_rise':.34,'base_pairs_per_turn':10.5,'backbone_phase_offset_degrees':145})
    strand_a=a.node(prefix+'_strand_a',root,concept='Strand A selection aggregate; nucleotide membership stored in extras.',select=False)
    strand_b=a.node(prefix+'_strand_b',root,concept='Antiparallel complementary strand B selection aggregate.',select=False)
    # Structural pair pivots facilitate insertion/deletion. Strand membership is semantic,
    # because a glTF node can have only one parent.
    a.g['nodes'][strand_a]['extras']['member_nodes']=[];a.g['nodes'][strand_b]['extras']['member_nodes']=[]
    pairs=[];bases=[];step=2*PI/10.5;phase=145*PI/180
    r=1.;sa=(r,0,0);sb=(r*math.cos(phase),0,-r*math.sin(phase));direction=unit(sub(sb,sa));angle=math.atan2(-direction[2],direction[0]);dist=length(sub(sb,sa))
    for i,letter in enumerate(sequence):
        y=(i-(len(sequence)-1)/2)*.34
        pair=a.node(f'{prefix}_base_pair_{i:03}',root,pos=(0,y,0),rot=qy(i*step),concept=f'Watson-Crick pair {letter}-{COMP[letter]}.',extras={'sequence_index':i,'base_pair':letter+COMP[letter]})
        pairs.append(pair);pair_bases=[]
        for side,base,p,heading in [('a',letter,sa,angle),('b',COMP[letter],sb,angle+PI)]:
            nuc=a.node(f'{prefix}_nucleotide_{side}_{i:03}',pair,pos=p,rot=qy(heading),concept='DNA nucleotide: deoxyribose, phosphate and nitrogenous base.',extras={'strand':side,'sequence_index':i,'base':base,'five_prime_direction':'lower_y' if side=='a' else 'upper_y'})
            a.g['nodes'][strand_a if side=='a' else strand_b]['extras']['member_nodes'].append(a.g['nodes'][nuc]['name'])
            a.node(f'{prefix}_nucleotide_sugar_{side}_{i:03}',nuc,a.geometry('sugar',sugar_geom),'sugar',concept='Puckered deoxyribose ring; schematic ring, hydrogens omitted.')
            bn=a.node(f'{prefix}_base_{BASE_NAMES[base]}_{side}_{i:03}',nuc,a.geometry('base_'+base,lambda b=base:base_geometry(b)),base,concept=f'{BASE_NAMES[base].capitalize()}: '+('purine, fused rings.' if base in 'AG' else 'pyrimidine, single ring.'),extras={'base':base,'replacement_pivot':[0,0,0]})
            pair_bases.append(bn)
            # Bond runs to next sugar along the helix; phase aligns with pair pivot.
            # terminal groups are phosphate termini, not fictitious inter-nucleotide bonds.
            ph=(0 if side=='a' else phase)
            if i<len(sequence)-1:
                pts=[(math.cos(ph+step*t),.34*t,-math.sin(ph+step*t)) for t in [k/10 for k in range(11)]]
                a.pipe(f'{prefix}_phosphodiester_bond_{side}_{i:03}',pair,pts,.034,'strand_a' if side=='a' else 'strand_b','Simplified 3-prime/5-prime phosphodiester linkage; oxygen atoms not individually resolved.')
                mid=pts[5]
            else:mid=add(p,(0,.08,0))
            a.node(f'{prefix}_phosphate_group_{side}_{i:03}',pair,a.geometry('phosphate',phosphate_geom),'phosphate',pos=mid,concept='Tetrahedral phosphate group, oxygen positions schematic.')
        bases.append(pair_bases)
        count=2 if letter in 'AT' else 3
        for j in range(count):
            transverse=(j-(count-1)/2)*.14
            start=add(add(sa,mul(direction,.68)),mul((-direction[2],0,direction[0]),transverse))
            end=add(add(sb,mul(direction,-.68)),mul((-direction[2],0,direction[0]),transverse))
            g=Geometry()
            for k in range(4):g.append(tube([lerp(start,end,k/4),lerp(start,end,(k+.58)/4)],.012,5))
            a.node(f'{prefix}_hydrogen_bond_{i:03}_{j}',pair,a.geometry(f'{prefix}_hb_{count}_{j}',g),'hydrogen',concept=f'One of {count} schematic hydrogen bonds in {letter}-{COMP[letter]}; dashed non-covalent contact.')
    return {'root':root,'pairs':pairs,'bases':bases,'strand_a':strand_a,'strand_b':strand_b,'step':step}

def nucleus(a,parent,prefix,pos=(0,0,0),size=1):
    root=a.node(prefix,parent,pos=pos,scale=(size,size,size),concept='Interphase nucleus with dispersed chromatin; condensed chromosomes shown in a separate mitotic scale stage.')
    a.shape(prefix+'_nuclear_envelope',root,'envelope',scale=(1.85,1.7,1.6),rough=.02,cut=True,detail=56,concept='Cutaway double-membrane nuclear envelope (bilayer separation simplified).')
    a.shape(prefix+'_nuclear_interior',root,'nucleoplasm',scale=(1.72,1.58,1.47),rough=.01,cut=True,detail=40,concept='Cutaway nuclear interior.')
    # Dispersed looping fibers constrained inside nucleus.
    for j in range(7):
        pts=[]
        for k in range(101):
            t=k/100*2*PI
            pts.append((1.35*math.sin(t+.64*j)*(.65+.18*math.cos(3*t)),1.25*math.cos(t*2+.8*j)*(.60+.20*math.sin(t)),.8*math.sin(t*3+j)*.7-.12))
        a.pipe(f'{prefix}_chromatin_{j:02}',root,pts,.035,'chromatin','Dispersed DNA-protein chromatin, diagrammatic fiber.',7)
    a.shape(prefix+'_nucleolus',root,'chromatin',pos=(.25,-.15,.55),scale=(.43,.36,.32),rough=.12,detail=32,concept='Nucleolus; site of ribosomal RNA production and ribosome assembly.')
    for j in range(11):
        t=PI+PI*(j+.5)/11;p=(1.8*math.cos(t),.15*math.sin(j*2),1.56*math.sin(t))
        pts=[add(p,(.12*math.cos(k*2*PI/16),.12*math.sin(k*2*PI/16),0)) for k in range(17)]
        a.pipe(f'{prefix}_nuclear_pore_{j:02}',root,pts,.033,'histone','Schematic nuclear pore complexes on cutaway envelope.',6)
    a.g['nodes'][root]['extras']['chromosome_focus_target']='chromosome'
    return root

def chromosome(a,parent):
    root=a.node('chromosome',parent,concept='Replicated condensed metaphase chromosome: two sister chromatids joined at a centromere. Not the usual interphase state.')
    for side in [-1,1]:
        name='left' if side<0 else 'right';chromatid=a.node('sister_chromatid_'+name,root,concept='One sister chromatid contains a continuous DNA molecule with histones and other proteins.')
        center=[]
        for i in range(101):
            y=-3+6*i/100;x=side*(.27+.65*(abs(y)/3)**.9);z=.10*math.sin(y*1.8)
            center.append((x,y,z))
        a.pipe('chromatid_core_'+name,chromatid,center,.34,'chromosome','Condensed chromatin mass; internal folding is schematic.',14)
        # Irregular winding follows chromosome arms; not an asserted 30 nm fiber model.
        for winding in range(3):
            pts=[]
            for i in range(501):
                y=-3+6*i/500;x=side*(.27+.65*(abs(y)/3)**.9);t=2*PI*(i/500*18+winding/3)
                rr=.33+.035*math.sin(i*.43+winding)
                pts.append((x+rr*math.cos(t),y,.10*math.sin(y*1.8)+rr*math.sin(t)))
            a.pipe(f'chromatin_surface_{name}_{winding}',chromatid,pts,.055,'chromatin' if winding%2 else 'histone','Stylized chromatin surface texture; not a literal chromosome folding map.',7)
    a.shape('centromere',root,'chromatin',scale=(.60,.27,.37),rough=.08,detail=32,concept='Primary constriction connecting sister chromatids.')
    region=a.node('chromosome_dna_focus_region',root,pos=(.88,2.4,.42),concept='Selectable illustrative nucleosome region for transition to DNA.')
    for i in range(4):
        a.shape(f'histone_core_{i:02}',region,'histone',pos=(.12*math.sin(i),i*.17-.25,0),scale=(.12,.09,.11),rough=.03,detail=16,concept='Schematic histone core; chromosomal DNA associates with histone proteins.')
    return root

def build_nested():
    a=Asset('nested_biology_model.glb');root=a.node('nested_biology_model',select=False,concept='Seven educational zoom stages. Spatial offsets separate biological scales.')
    stage=a.node('stage_cell',root)
    cell=a.node('cell',stage,concept='Cutaway generic animal eukaryotic cell.')
    a.shape('cell_membrane',cell,'membrane',scale=(5.4,4.6,3.8),rough=.026,cut=True,detail=72,concept='Opaque membrane cutaway exposes organelles without excessive transparency.')
    a.shape('cytoplasm',cell,'cytoplasm',scale=(5.22,4.42,3.63),rough=.012,cut=True,detail=64,concept='Cutaway cytoplasm; bulk cytosol is not rendered as an occluding solid.')
    nucleus(a,cell,'cell_nucleus',(-.65,.65,.15),1.12)
    for j,(p,s) in enumerate([((3,1.8,.1),(1.0,.45,.48)),((2.4,-2.2,.1),(1.12,.44,.48)),((-3,-1.6,.25),(.92,.44,.46))]):
        org=a.node(f'mitochondrion_{j:02}',cell,pos=p,rot=[0,0,math.sin((j-.6)*.28),math.cos((j-.6)*.28)],concept='Cutaway mitochondrion with folded inner membrane.')
        a.shape(f'mitochondrion_outer_membrane_{j:02}',org,'mitochondria',scale=s,rough=.02,cut=True,detail=40)
        for k in range(7):
            x=(k-3)*s[0]/4.4;pts=[(x+.07*math.sin(t*PI*2),s[1]*.75*math.cos(t*PI),.10+.15*math.sin(t*PI)) for t in [m/16 for m in range(17)]]
            a.pipe(f'mitochondrion_crista_{j:02}_{k}',org,pts,.046,'cristae','Inner membrane fold (crista).',7)
    er=a.node('endoplasmic_reticulum',cell,concept='Schematic folded endoplasmic-reticulum cisternae adjacent to the nucleus.')
    for j in range(5):
        pts=[]
        for k in range(91):
            t=.15*PI+1.25*PI*k/90;r=2.35+j*.26
            pts.append((-.55+r*math.cos(t),.35+r*.83*math.sin(t),-.35+.08*math.sin(t*8+j)))
        a.pipe(f'er_cisterna_{j:02}',er,pts,.12,'er','Simplified membrane cisterna; ribosomes omitted at cell scale.',10)
    a.level('cell',stage,(0,0,0),(0,1,18.5),18.5,'Eukaryotic cell with cutaway membranes.')
    st=a.node('stage_nucleus',root,pos=(30,0,0));nucleus(a,st,'nucleus',size=2)
    a.level('nucleus',st,(30,0,0),(30,.6,14.5),14.5,'Nuclear envelope and interphase chromatin.','cell')
    st=a.node('stage_chromosome',root,pos=(60,0,0));chromosome(a,st)
    a.level('chromosome',st,(60,0,0),(60,.2,12),12,'Replicated condensed metaphase chromosome.','nucleus')
    st=a.node('stage_dna',root,pos=(90,0,0));d=dna(a,st,'dna','ATGCGTACGATCGATGCTACGTAA')
    a.level('dna',st,(90,0,0),(90,1,14),14,'Right-handed antiparallel B-DNA with major and minor grooves.','chromosome')
    # Mark a contiguous segment of the full helix for highlighting.
    gene=a.node('gene_region',d['root'],concept='Illustrative selected DNA segment associated with a functional product; 9 bp shown are not a complete gene.',extras={'member_nodes':[a.g['nodes'][p]['name'] for p in d['pairs'][8:17]],'sequence_range_zero_based_half_open':[8,17]})
    st=a.node('stage_gene',root,pos=(120,0,0));dna(a,st,'gene_detail','GATCGATGC',1.75)
    a.level('gene',st,(120,0,0),(120,.7,12),12,'Magnified selected segment; real genes are substantially longer.','dna')
    st=a.node('stage_base_pair',root,pos=(150,0,0));dna(a,st,'nucleotide_detail','ATGC',2.6)
    a.level('base_pair',st,(150,0,0),(153.4,9,11.5),15,'Deoxyribose, phosphate, four base identities, A-T and G-C pairs.','gene')
    st=a.node('stage_bonds',root,pos=(180,0,0));dna(a,st,'molecular_detail','AG',3.7)
    a.level('bonds',st,(180,0,0),(183.3,11,11),15.9,'Dashed hydrogen contacts vs continuous covalent backbone linkages.','base_pair')
    # Default embedded camera frames only the initial cell stage.
    a.g['cameras']=[{'name':'initial_cell_camera','type':'perspective','perspective':{'yfov':38*PI/180,'znear':.01,'zfar':350}}]
    pitch=-math.atan(1/18.5)
    cam=a.node('initial_cell_camera',root,pos=(0,1,18.5),rot=[math.sin(pitch/2),0,0,math.cos(pitch/2)],select=False);a.g['nodes'][cam]['camera']=0
    return a

def blob_complex(a,parent,name,pos,scale,mat,concept):
    return a.shape(name,parent,mat,pos,scale,.13,False,52,concept)

def build_expression():
    a=Asset('gene_expression_scene.glb');root=a.node('gene_expression_scene',concept='Separated transcription and translation teaching stations. Eukaryotic processing/export omitted; not simultaneous nuclear translation.')
    station=a.node('transcription_station',root,pos=(-5,1,0),concept='Nuclear process: template DNA read 3-prime to 5-prime; RNA made 5-prime to 3-prime.')
    d=dna(a,station,'expression_dna','TACGGCATTCGATAC',.8)
    a.g['nodes'][d['strand_b']]['extras']['role']='template';a.g['nodes'][d['strand_a']]['extras']['role']='coding'
    polymerase=a.node('rna_polymerase',station,pos=(0,-1,0),concept='Schematic RNA polymerase molecular envelope with DNA-binding cleft.')
    blob_complex(a,polymerase,'rna_polymerase_lobe_01',(-.73,0,-.18),(.76,.87,.83),'polymerase','Schematic polymerase domain.')
    blob_complex(a,polymerase,'rna_polymerase_lobe_02',(.77,.10,-.16),(.64,.74,.78),'polymerase','Schematic polymerase domain.')
    blob_complex(a,polymerase,'rna_polymerase_bridge',(0,.15,-.69),(.74,.55,.40),'polymerase','Bridge behind DNA-binding cleft.')
    a.clip('transcription',6,[(polymerase,'translation',[0,6],[(0,-1,0),(0,1.6,0)])],'Polymerase advances along the template strand; local melting and chemistry are schematic.')
    rna=a.node('mrna_strand',root,concept='Schematic messenger RNA spanning separate teaching stations; not a literal nuclear export path.',extras={'five_prime_end':'left','three_prime_end':'right','sequence_computed_by_host':True})
    rna_segments=[]
    for i in range(28):
        x=-4.1+i*.31;y=-1.7+.10*math.sin(i*.65);z=.42+.10*math.cos(i*.7)
        segment=a.node(f'mrna_segment_{i:03}',rna,pos=(x,y,z),scale=(1,1,1) if i<4 else (.001,.001,.001),concept='RNA segment visual unit; not a fixed codon or base assignment.')
        a.pipe(f'mrna_backbone_{i:03}',segment,[(0,0,0),(.16,.045,0),(.32,.025,.015)],.055,'rna','RNA sugar-phosphate backbone.',8)
        a.pipe(f'mrna_base_stub_{i:03}',segment,[(.12,0,0),(.12,.19,.04)],.038,'rna','Schematic RNA base; host supplies sequence identity.',6)
        rna_segments.append(segment)
    tracks=[]
    for i,n in enumerate(rna_segments):
        start=i*.13;end=start+.18
        tracks.append((n,'scale',[0,start+.01,end,4.2],[(.001,)*3,(.001,)*3,(1,)*3,(1,)*3]))
    a.clip('mrna_emergence',4.2,tracks,'Sequentially reveals an illustrative mRNA strand. RNA synthesis direction is represented schematically, not atomically.')
    rib=a.node('ribosome',root,pos=(2,-1.7,.5),concept='Cytoplasmic ribosome; moves from the mRNA 5-prime toward 3-prime end.')
    blob_complex(a,rib,'ribosome_large_subunit',(0,.64,-.12),(1.18,.85,.85),'ribosome','Large subunit: peptide bond formation; molecular envelope approximation.')
    blob_complex(a,rib,'ribosome_small_subunit',(0,-.45,0),(1.0,.45,.65),'ribosome_small','Small subunit: decoding mRNA; molecular envelope approximation.')
    a.clip('ribosome_translation',5,[(rib,'translation',[0,5],[(2,-1.7,.5),(3.15,-1.7,.5)])],'Ribosome translocation along mRNA; codon identities are assigned by the host.',['Complete mrna_emergence or externally show the mRNA.','Restore the ribosome rest transform.'])
    trna=a.node('trna',root,pos=(5.1,.0,1.3),concept='Folded L-shaped tRNA schematic; anticodon loop and amino-acid attachment end.',extras={'anticodon_site_local':[0,-.55,0],'amino_acid_attachment_local':[-.58,.75,0]})
    points=[(0,-.55,0),(.18,-.30,.04),(.1,.12,.08),(.0,.44,.03),(-.28,.65,0),(-.58,.75,0)]
    a.pipe('trna_folded_backbone',trna,points,.095,'trna','L-shaped RNA fold.',10)
    a.pipe('trna_anticodon_loop',trna,[(.16*math.cos(i*2*PI/24),-.56+.17*math.sin(i*2*PI/24),.03) for i in range(25)],.065,'trna','Anticodon loop; individual nucleotides simplified.',8)
    a.shape('trna_attached_amino_acid',trna,'protein',pos=(-.62,.79,0),scale=(.14,.12,.12),rough=.08,detail=20,concept='Amino acid linked to the tRNA acceptor end.')
    a.clip('trna_entry',2.4,[(trna,'translation',[0,2.4],[(5.1,0,1.3),(2.4,-.9,1.15)])],'tRNA approaches the decoding site. Anticodon pairing and chemical transfer are simplified.',['Show mRNA and restore ribosome to its start position.'])
    chain=a.node('amino_acid_chain',rib,pos=(-.35,1.30,.2),concept='Nascent polypeptide emerges from the large subunit; protein is separate from DNA.')
    tracks=[]
    for i in range(14):
        p=(.29*math.sin(i*.6),i*.24,.16*math.cos(i*.7));n=a.node(f'amino_acid_{i:03}',chain,pos=p,scale=(.001,)*3,concept='Amino-acid residue visual unit; host provides residue identity.')
        a.shape(f'amino_acid_surface_{i:03}',n,'protein',scale=(.14,.16,.12),rough=.08,detail=20)
        if i>0:
            prev=(.29*math.sin((i-1)*.6),(i-1)*.24,.16*math.cos((i-1)*.7))
            a.pipe(f'peptide_bond_{i:03}',n,[sub(prev,p),(0,0,0)],.042,'protein','Schematic covalent peptide linkage.',7)
        t=i*.24;tracks.append((n,'scale',[0,t+.01,t+.23,3.6],[(.001,)*3,(.001,)*3,(1,)*3,(1,)*3]))
    a.clip('amino_acid_chain_growth',3.6,tracks,'Sequentially reveals nascent amino-acid residues and peptide linkages.',['Show the mRNA; translation and residue sequence logic belong to the host.'])
    a.level('gene_expression',root,(0,.4,0),(0,3,22),22,'Transcription and translation at separate conceptual stations.')
    return a

def build_mutation():
    a=Asset('mutation_scene.glb');root=a.node('mutation_scene',concept='Reusable local DNA editing visual; host owns sequence, reading frame and consequences.')
    d=dna(a,root,'mutation_dna','ATGCTAACGTGC');i=5;target=d['pairs'][i]
    a.g['nodes'][target]['name']='mutation_target_pair';a.names['mutation_target_pair']=target
    target_base=d['bases'][i][0];oldname=a.g['nodes'][target_base]['name'];a.g['nodes'][target_base]['name']='mutation_target_base';a.g['meshes'][a.g['nodes'][target_base]['mesh']]['name']='mutation_target_base';a.g['nodes'][target_base]['extras']['semantic_id']='mutation_target_base';a.names['mutation_target_base']=target_base
    a.g['nodes'][target]['extras'].update({'semantic_id':'mutation_target_pair','sequence_index':i,'substitution_example':'A-T to G-C','mutation_region':True})
    # Replacement bases retain the original sugar attachment pivots and swap both strands.
    replacements=[]
    for old,letter in zip(d['bases'][i],['G','C']):
        p=a.parents[old];n=a.node(f'mutation_replacement_base_{letter}',p,a.geometry('base_'+letter,lambda b=letter:base_geometry(b)),letter,scale=(.001,)*3,concept='Prepared alternate base geometry at the original glycosidic attachment pivot.',extras={'base':letter,'initially_hidden':True});replacements.append(n)
    tracks=[]
    for old,new in zip(d['bases'][i],replacements):
        tracks.extend([(old,'scale',[0,.7,.9,1.8],[(1,)*3,(1,)*3,(.001,)*3,(.001,)*3]),(new,'scale',[0,.9,1.15,1.8],[(.001,)*3,(.001,)*3,(1,)*3,(1,)*3])])
    old_hb=[n for n in a.g['nodes'][target].get('children',[]) if 'hydrogen_bond' in a.g['nodes'][n]['name']]
    # Swap the two A-T contacts for three G-C contacts as part of substitution.
    for n in old_hb:tracks.append((n,'scale',[0,.7,.9,1.8],[(1,)*3,(1,)*3,(.001,)*3,(.001,)*3]))
    # Clone a G-C contact pattern from an existing G-C pair using shared buffers.
    gc_pair=d['pairs'][2]
    for j,src in enumerate([n for n in a.g['nodes'][gc_pair].get('children',[]) if 'hydrogen_bond' in a.g['nodes'][n]['name']]):
        mesh=a.g['meshes'][a.g['nodes'][src]['mesh']]['primitives'][0]
        geom=(mesh['attributes'],mesh['indices'],a.mesh_tri[a.g['nodes'][src]['mesh']])
        n=a.node(f'mutation_replacement_hydrogen_bond_{j}',target,geom,'hydrogen',scale=(.001,)*3,concept='One of three G-C hydrogen contacts.')
        tracks.append((n,'scale',[0,.9,1.15,1.8],[(.001,)*3,(.001,)*3,(1,)*3,(1,)*3]))
    a.clip('base_substitution',1.8,tracks,'Example complementary A-T to G-C substitution; sugars and phosphate pivots remain stable.')
    a.clip('highlight_mutation',1.2,[(target_base,'scale',[0,.6,1.2],[(1,)*3,(1.13,)*3,(1,)*3])],'Subtle target-base pulse; host may alternatively highlight its material.')
    insert=dna(a,root,'insertion_nucleotide','GC')
    # Keep a two-pair building block to provide the inserted pair and its outgoing link.
    ins_root=insert['root'];a.g['nodes'][ins_root]['scale']=[.001]*3
    # Second helper pair is permanently hidden; its geometry is a reusable spare.
    a.g['nodes'][insert['pairs'][1]]['scale']=[.001]*3
    y=a.g['nodes'][d['pairs'][i+1]]['translation'][1]+.17
    a.g['nodes'][ins_root]['translation']=[0,y,0];a.g['nodes'][ins_root]['rotation']=qy((i+1)*d['step'])
    tracks=[(ins_root,'scale',[0,.55,1.3,2.5],[(.001,)*3,(.001,)*3,(1,)*3,(1,)*3])]
    for p in d['pairs'][i+1:]:
        pos=a.g['nodes'][p]['translation'];idx=a.g['nodes'][p]['extras']['sequence_index']
        tracks.extend([(p,'translation',[0,1,2.5],[pos,add(pos,(0,.34,0)),add(pos,(0,.34,0))]),(p,'rotation',[0,1,2.5],[qy(idx*d['step']),qy((idx+1)*d['step']),qy((idx+1)*d['step'])])])
    a.clip('nucleotide_insertion',2.5,tracks,'Insert a complementary G-C pair and shift/rephase downstream pairs. Linkage connectivity is restored at the endpoint; intermediate backbone motion is schematic.')
    tracks=[(target,'scale',[0,.65,2.5],[(1,)*3,(.001,)*3,(.001,)*3])]
    for p in d['pairs'][i+1:]:
        pos=a.g['nodes'][p]['translation'];idx=a.g['nodes'][p]['extras']['sequence_index']
        tracks.extend([(p,'translation',[0,.65,1.7,2.5],[pos,pos,add(pos,(0,-.34,0)),add(pos,(0,-.34,0))]),(p,'rotation',[0,.65,1.7,2.5],[qy(idx*d['step']),qy(idx*d['step']),qy((idx-1)*d['step']),qy((idx-1)*d['step'])])])
    a.clip('nucleotide_deletion',2.5,tracks,'Remove one complementary nucleotide pair and close/rephase the downstream helix. DNA repair chemistry is not represented.')
    a.level('mutation',root,(0,0,0),(0,1,10),10,'Substitution, insertion and deletion visual states; sequence logic is external.')
    return a

def metadata(assets):
    objects=[];levels=[]
    for a in assets:
        levels.extend(a.levels)
        level_roots={a.names[l['root_node']]:l for l in a.levels}
        def world(i,p=(0,0,0)):
            n=a.g['nodes'][i];p=tuple(p[j]*n.get('scale',[1]*3)[j] for j in range(3));p=rotate(n.get('rotation',[0,0,0,1]),p);p=add(p,n.get('translation',[0,0,0]));parent=a.parents[i]
            return world(parent,p) if parent is not None else p
        for i,n in enumerate(a.g['nodes']):
            p=a.parents[i];ancestor=i;level=None
            while ancestor is not None:
                if ancestor in level_roots:level=level_roots[ancestor];break
                ancestor=a.parents[ancestor]
            level=level or a.levels[0];name=n['name'];id=a.filename+'/'+name
            children=n.get('children',[])
            objects.append({'id':id,'glb':a.filename,'node_name':name,'mesh_name':a.g['meshes'][n['mesh']]['name'] if 'mesh'in n else None,'node_index':i,'parent_id':a.filename+'/'+a.g['nodes'][p]['name'] if p is not None else None,'child_ids':[a.filename+'/'+a.g['nodes'][c]['name'] for c in children],'hierarchy_level':level['id'],'camera_position':level['camera_position'],'camera_look_at':level['look_at'],'recommended_distance':level['distance'],'camera_scope':'stage framing; use runtime mesh bounds for tighter object focus','pivot_local':[0,0,0],'pivot_world_rest':list(world(i)),'rest_transform':{'translation':n['translation'],'rotation':n.get('rotation',[0,0,0,1]),'scale':n['scale']},'selectable':n['extras']['selectable'],'educational_concept':n['extras']['concept'] or level['educational_concept'],'semantic':n['extras']})
        for l in a.levels:
            l['selectable_mesh_ids']=[o['id'] for o in objects if o['glb']==a.filename and o['hierarchy_level']==l['id'] and o['mesh_name'] and o['selectable']]
            l['visible_root_nodes']=[l['root_node']]
            l['hidden_root_nodes']=[x['root_node'] for x in a.levels if x['id']!=l['id']]
    order=['cell','nucleus','chromosome','dna','gene','base_pair','bonds'];names=['cell_to_nucleus','nucleus_to_chromosome','chromosome_to_dna','dna_to_gene','gene_to_base_pair','base_pair_to_bonds']
    transitions=[{'name':name,'from':order[i],'to':order[i+1],'control':'external_camera_and_visibility','embedded':False,'recommended_duration_seconds':1.1,'interruptible':True,'reversible':True,'method':'Activate destination stage and interpolate to its camera target; optionally cross-fade in host. Rebase current camera on interruption.','scale_change':'educational magnification; not a physical camera traverse through one cell'} for i,name in enumerate(names)]
    return {'schema_version':'1.0','coordinate_system':'glTF right handed, Y up, camera looks down local -Z','default_level':'cell','levels':levels,'transitions':transitions,'objects':objects,'selection':'Raycast visible mesh nodes; resolve stable IDs by GLB filename + node name. Empty semantic groups expose member_nodes for multi-mesh highlighting. Disable raycast on hidden/scaled-down spare geometry.','reset':'Stop all clips. Restore recorded rest transforms and initial stage visibility. Restore base materials after highlighting.'}

LIMITATIONS=[
 'Procedural educational reconstructions, not experimental molecular structures or atomistically validated chemical models.',
 'Base ring geometry, sugar puckering, phosphate oxygen placement and hydrogen-contact endpoints are schematic; donor/acceptor atom connectivity is not encoded.',
 'Cutaway membranes are open surfaces, not watertight lipid bilayers. Nuclear pores, ER, organelle counts and chromosome folding are simplified.',
 'X-shaped chromosome is a replicated condensed mitotic state. Cell/nucleus stages instead show dispersed interphase chromatin.',
 'DNA gene highlight is a short illustrative segment, not a complete biologically annotated gene.',
 'Separate scale stages share one GLB but are not physically nested at a common scale. Host must apply stage visibility metadata.',
 'Expression clips illustrate component motion and sequential reveal; DNA melting, RNA processing/export, atomistic catalysis and codon/anticodon chemistry are omitted.',
 'Mutation clips provide one canonical site/example. Host supplies arbitrary sequence edits, changes semantic base assignments, and rebuilds persistent backbone connectivity for custom edits.',
 'Insertion/deletion manipulate a complementary base pair. Sequence positions remain original stable IDs until the host remaps them. Intermediate motion is illustrative.',
 'Scale 0.001 is used for hidden animation parts; host must disable their raycasting and may set visibility false when inactive.',
 'No textures or baked lighting. Host provides lights/environment and camera control. No visual renderer review was performed; geometry and loader validation are reported separately.'
]

README='''# OLAB 2 — 3D asset package

These are actual glTF 2.0 binary assets, with editable procedural Python sources.
They are scientifically informed teaching models, not experimental atomic structures.

## Files

- `nested_biology_model.glb`: seven scale stages, cell through molecular bonds.
- `gene_expression_scene.glb`: separate transcription and translation stations; five embedded clips.
- `mutation_scene.glb`: selectable DNA nucleotides; four embedded clips.
- `model_hierarchy.json`: exact node/mesh names, structural parents, semantic membership, rest transforms, camera and visibility targets.
- `animation_manifest.json`: only exported clips, durations and exact start/end property states; six external camera transitions.
- `asset_manifest.json`: measured sizes, triangle counts, hashes, meshes and limitations.
- `validation_report.json`: results of independent binary/metadata and Khronos/Three.js validation when available.
- `source/generate_assets.py`: all three assets, reproducible without third-party Python libraries.
- `source/validate_assets.py`: structural, geometric and metadata checks.
- `source/validate_runtime.mjs`: independent Khronos validator and Three.js GLTFLoader check (Node dependencies required).

## Rebuild

From this directory, run `python source/generate_assets.py --output .` with Python 3.10 or later.
Then run `python source/validate_assets.py --output .`.
Generation uses no randomness, external meshes, downloaded textures, Blender or runtime extensions.
To edit in Blender, import any GLB through File > Import > glTF 2.0. A native `.blend` file is not included.
The direct authoring source is the canonical source, not a Blender-only export script.

## Integration contract

Use GLTFLoader to load each file. Mesh and node names are unique within each asset; stable IDs are `filename/node_name`.
Read node `extras` as loader userData. Important components remain separate meshes.
For group selection, recurse through children or use `extras.member_nodes`; aggregate strand/gene groups are empty nodes because glTF permits only one structural parent per node.
Clone a material before per-object highlighting: intentionally shared materials otherwise recolor multiple objects.

For the explorer, initialize **only `stage_cell` visible**. Hide other `stage_*` roots according to the level record.
All stages are spatially separated along X to avoid overlapping selection targets, and all are exported with normal transforms.
The embedded initial camera frames the cell. Generic viewers that frame the entire file will show a row of stages; that is expected.
Apply world-space camera positions and look-at targets from metadata, 38-degree vertical field of view.
Camera framing assumes a viewport at least square; for portrait viewports, fit the visible stage bounds to the smaller dimension.
Camera positions are stage views, not measured microscopy lengths. Object pivot metadata is for rest state.
Do not reset the overall GLB transform or re-center individual stages without transforming the corresponding camera metadata.

Transition IDs connect the educational graph; node parents describe the actual glTF scene graph.
To interrupt a transition, cancel interpolation, use the current camera as the next start, and apply the selected level's visibility policy.
Back navigation reverses the educational edge. Reset restores rest transforms/materials, `stage_cell`, and the cell camera.
An external reveal operation can hide `cell_membrane`, `cytoplasm`, or nuclear-envelope nodes; cutaways already reveal the main structures.

Clips are individual AnimationMixer actions. Run once, clamp at completion, and pause via action/mixer controls.
No playback is automatic. Before a clip, satisfy prerequisites and restore its relevant rest transforms.
Stop conflicting actions before starting a new mutation operation. Mutation clips are alternatives from the same rest state, not cumulative edits.
After stopping a clip, restore the `rest_transform` values from model_hierarchy; stopping an action alone is not a reliable full-scene reset.
Scale-reveal animation uses 0.001 instead of singular zero matrices. Filter tiny spare parts from raycasting.
For repeated mutations or arbitrary sequences, update host sequence state, swap base geometry and complementary bases, and rebuild links as needed.
The supplied substitution demonstrates A-T to G-C and changes two dashed hydrogen contacts to three.
Insertion adds G-C after original index 5; deletion removes original index 5. IDs stay stable instead of being renumbered.
RNA segments and amino-acid visual units deliberately have no fixed codon/residue assignment: the host computes those.

## Geometry, materials and scientific scope

Right-handed DNA uses 10.5 base pairs/turn, rise 0.34 and diameter approximately 2 in stage units before magnification.
Strand A runs 5-prime to 3-prime toward +Y; B is antiparallel. The expression template is B.
Backbone angular offsets create unequal groove widths. A-T has two schematic hydrogen contacts; G-C has three.
Sugars, phosphates, aromatic-ring base meshes, dashed hydrogen contacts and solid backbone links are separately addressable.
Base hues are consistent: A muted olive, T terracotta, G ochre, C slate. Colours convey identity, not natural molecular colour.
All materials use opaque, nonmetallic PBR; no labels, glow, particles, UI, baked lights, images or frontend are included.
Shared geometry buffers reduce size while uniquely named meshes preserve selection. Triangle counts include hidden helpers.
There is no Draco/Meshopt dependency. The host should frustum-cull and explicitly hide inactive stages.
Proteins, amino acids and peptide bonds occur in the expression scene; histones are correctly associated with chromatin.

See the manifest's limitations for the exact simplified and missing structures. A structural validation pass does not certify biological atomic accuracy or visual polish.
Format reference: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
'''

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1]);args=parser.parse_args();out=args.output;out.mkdir(parents=True,exist_ok=True)
    assets=[build_nested(),build_expression(),build_mutation()]
    entries=[a.save(out) for a in assets];hier=metadata(assets)
    def write(name,obj):(out/name).write_text(json.dumps(obj,indent=2)+'\n',encoding='utf-8')
    write('model_hierarchy.json',hier)
    write('animation_manifest.json',{'schema_version':'1.0','clips':[c for a in assets for c in a.clips],'external_actions':hier['transitions'],'policy':'No auto-play. Each named clip is independently controllable. Mutation clips must not run concurrently.'})
    write('asset_manifest.json',{'schema_version':'1.0','assets':entries,'known_limitations':LIMITATIONS,'missing_features':['Native Blender .blend file','Experimental atomistic coordinates and chemistry graph','Host sequence/codon/translation calculations (intentionally external)','Automatic material highlighting and camera transitions (intentionally external)'],'validation':'See validation_report.json; no validation results are presumed by the generator.','source':'source/generate_assets.py','unit_policy':'Illustrative glTF units; stage-specific magnification.'})
    (out/'README_3D_ASSETS.md').write_text(README,encoding='utf-8')
    for e in entries:print(e['filename'],e['size_bytes'],'bytes,',e['triangle_count_instanced'],'triangles,',e['mesh_count'],'meshes, clips:',','.join(e['animation_clips']))

if __name__=='__main__':main()
