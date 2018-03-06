/*
* author : sandiemann
* modified : 3/6/18
*/

/*jslint es6 */

//default settings
const defaultSettings = {
	blackSphereRadius : 0.1,
	sphereRadius : 2,
	numOfBalls : 5,
	ballRadius : 0.1,
	offset: 1.5
}

/*---------local variables----------*/
const ballArray = new Array(defaultSettings.numOfBalls);
const normalArr = new Array();
let blackSphereVelX = 0; 
let blackSphereVelY = 0;
let blackSphereVelZ = 0;
const ballVelX = new Array(defaultSettings.numOfBalls);
const ballVelY = new Array(defaultSettings.numOfBalls);
const ballVelZ = new Array(defaultSettings.numOfBalls);
/*----------------------------------*/

// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas : canvas});
//renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('white');    // set background color

// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(scene.position);   // camera looks at origin
const ambientLight = new THREE.AmbientLight("white" );
scene.add(ambientLight);

// add axis helper
//const axesHelper = new THREE.AxesHelper(5);

// add key control events
function keyControl(event) {
	console.log(event.keyCode);
	if(event.keyCode === 37) //Left
		blackSphereVelX = -1;
	else if(event.keyCode === 38) //Up
		blackSphereVelY = 1;
	else if(event.keyCode === 39) //Right
		blackSphereVelX = 1;
	else if(event.keyCode === 40) //Down
		blackSphereVelY = -1;
}
document.addEventListener("keydown", keyControl);
document.addEventListener("keyup", function() { blackSphereVelX=0;  blackSphereVelY=0; /* blackSphereVelZ=0; */});


// create wireframe sphere geometry
const geometry = new THREE.SphereGeometry(defaultSettings.sphereRadius, 32,32);
const material = new THREE.MeshPhongMaterial({color: "gray", wireframe:true} );
const sphere = new THREE.Mesh(geometry, material);

material.transparent = true;
material.opacity = 0.5;
scene.add(sphere);
//scene.add(axesHelper);

// create black sphere and position in the centre
const blackSphere = new THREE.Mesh(new THREE.SphereGeometry( defaultSettings.blackSphereRadius, 16,16), new THREE.MeshPhongMaterial({color: "black"} ));
			   	
blackSphere.position.z += 1.5; // to avoid collision with the balls in the beginning
sphere.add(blackSphere);

// create/add balls
for(let i=0; i<defaultSettings.numOfBalls; i++){

	ballArray[i] = new THREE.Mesh(new THREE.SphereGeometry(defaultSettings.ballRadius,16,16),new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff} ));
	sphere.add(ballArray[i]);
	ballArray[i].position.x =  Math.random()*1.2; // setting starting position of small spheres	
	ballArray[i].position.y =  Math.random()*1.2;
	//ballArray[i].position.z =  Math.random()*defaultSettings.offset;
	
	ballVelX[i] = Math.random()*defaultSettings.offset;
	ballVelY[i] = Math.random()*defaultSettings.offset;
	ballVelZ[i] = Math.random()*defaultSettings.offset;
	
} 

function Collision(Sphere, balls, VelX, VelY, VelZ){
	
	const tempArray = new Array(defaultSettings.numOfBalls);
	
	let distance = new THREE.Vector3(Sphere.position.x, Sphere.position.y, Sphere.position.z);
	let length = new THREE.Vector3(Sphere.position.x, Sphere.position.y, Sphere.position.z).length();
	
	for (let i =0; i<defaultSettings.numOfBalls; i++){
		
		tempArray[i] = new THREE.Vector3(balls[i].position.x,balls[i].position.y,balls[i].position.z);
		
		if ((((tempArray[i]).sub(distance)).length())<= (defaultSettings.blackSphereRadius + defaultSettings.ballRadius)){
			console.log("Game Over!!");
			//alert("Game Over!!");
			
			// Stop the movement..
			for (let j =0; j<defaultSettings.numOfBalls; j++){	
				VelX[j] = 0;	
				VelY[j] = 0;
				VelZ[j] = 0;
			} 
						
		}
		else if(length >= (defaultSettings.sphereRadius - defaultSettings.blackSphereRadius)){
			console.log("Game Over!!");
			//alert("Game Over!!");
			
			// Stop the movement..
			for (let j =0; j<defaultSettings.numOfBalls; j++){	
				VelX[j] = 0;	
				VelY[j] = 0;
				VelZ[j] = 0;
			} 
		}
	}
			
}

function SpecRef (vin, normal){
	let n2 = normal.clone();
	n2.normalize();
	let ref = vin.clone();
	let f = 2 * n2.clone().dot(vin);
	ref.sub(n2.clone().multiplyScalar(f));
	return ref;
}

// Draw everthing			
const controls = new THREE.TrackballControls( camera, canvas );
const clock = new THREE.Clock();
function render(){
	
	requestAnimationFrame(render);
	const delta = clock.getDelta();
	const etime = clock.getElapsedTime();
		
	blackSphere.position.x += blackSphereVelX*delta;	
	blackSphere.position.y += blackSphereVelY*delta;
	/* blackSphere.position.z += blackSphereVelZ;	 */
	
	for(let i=0; i<defaultSettings.numOfBalls; i++){
		ballArray[i].position.x += ballVelX[i]*delta;
		ballArray[i].position.y += ballVelY[i]*delta;
		ballArray[i].position.z += ballVelZ[i]*delta;
		
		normalArr[i] = new THREE.Vector3(ballArray[i].position.x, ballArray[i].position.y, ballArray[i].position.z);
		if ((normalArr[i].length()) >= (defaultSettings.sphereRadius - defaultSettings.ballRadius)){
			 let vin = new THREE.Vector3(ballVelX[i],ballVelY[i],ballVelZ[i]);
			 let vout = SpecRef(vin, normalArr[i]);
			 ballVelX[i] = vout.x;
			 ballVelY[i] = vout.y;
			 ballVelZ[i] = vout.z;
		}
	}
	
	// function to detect collision with black sphere
	Collision(sphere, ballArray, ballVelX, ballVelY, ballVelZ);
	
	controls.update();
	renderer.render(scene, camera);
}
		
render();
