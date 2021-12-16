import * as THREE from 'three';
import metaversefile from 'metaversefile';

const {useApp, useFrame, useLoaders, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1'); 


export default () => {  

    const app = useApp();
    const physics = usePhysics();
    const physicsIds = [];
    
    //console.log( 'texture path: ' + baseUrl + "textures/silk/silk-contrast-noise.png" );
    //console.log( 'SilkShader = ' + SilkShader.vertexShader )
    console.log( 'GREAT FILTER INIT ', app )
    
    const debugMaterial = new THREE.MeshNormalMaterial();

    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {
                
            //const loader = new GLTFLoader();
            const { gltfLoader } = useLoaders();
            const { dracoLoader } = useLoaders();
            gltfLoader.setDRACOLoader( dracoLoader );
    
            gltfLoader.load( params.filePath + params.fileName, function( gltf ) {
    
                let numVerts = 0;
    
                gltf.scene.traverse( function ( child ) {

                    const physicsId = physics.addGeometry( child );
                    physicsIds.push( physicsId );
    
                    if ( child.isMesh ) {
    
                        numVerts += child.geometry.index.count / 3;  
                
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
    
                console.log( `Silk Fountain Great Filter modelLoaded() -> ${ params.fileName } num verts: ` + numVerts );
    
                gltf.scene.position.set( params.pos.x, params.pos.y, params.pos.z  );

                resolve( gltf.scene );     
            });
        })
    }

    let p1 = loadModel( { 
        filePath: baseUrl,
        fileName: 'GreatFilter_GateSegment_V3_galad.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    let p2 = loadModel( { 
        filePath: baseUrl,
        fileName: 'GreatFilter_WallSegment_V3_galad.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    Promise.all( 
        [ p1, p2 ]
    ).then( 
        ( values ) => {
            values.forEach( model => {
                app.add( model )

                console.log( 'GF model ready: ' + model.position.z )

                model.position.z = 5000;
            })
        }
    )

    useFrame(( { timestamp } ) => {
        //console.log( 'timestamp ', silkShaderMaterial.uniforms.noiseImage );
        if( app.children.length ) app.children[ 0 ].position.x += 100;
        //console.log( 'app children ' +  )
    });

    useCleanup(() => {
      for (const physicsId of physicsIds) {
       physics.removeGeometry(physicsId);
      }
    });

    return app;
}