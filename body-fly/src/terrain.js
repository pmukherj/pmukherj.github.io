import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

// The same gently undulating height field is used for drawing and collision.
export function terrainHeightAt(x, z) {
  return -13
    + Math.sin(x * 0.025) * 2.6
    + Math.cos(z * 0.02) * 2.3
    + Math.sin((x + z) * 0.04) * 1.1;
}

export function createTerrain() {
  const size = 2000;
  const segments = 160;
  const grassTexture = new THREE.TextureLoader().load('./public/assets/grassland-tile.png');
  grassTexture.colorSpace = THREE.SRGBColorSpace;
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(50, 50);
  const terrain = new THREE.Group();
  terrain.userData.tileSize = size;
  terrain.userData.tileCenter = new THREE.Vector2(0, 0);

  // Nine overlapping tiles keep the visible world covered even when a steep
  // pitch or bank points the camera toward the side of the flight path.
  for (let z = -1; z <= 1; z += 1) {
    for (let x = -1; x <= 1; x += 1) {
      const tile = createTerrainTile(size, segments, grassTexture);
      tile.userData.gridOffset = new THREE.Vector2(x, z);
      paintTerrainTile(tile, x * size, z * size);
      terrain.add(tile);
    }
  }
  return terrain;
}

function createTerrainTile(size, segments, grassTexture) {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(
    new Array(geometry.attributes.position.count * 3).fill(1),
    3,
  ));
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    map: grassTexture,
    vertexColors: true,
    color: 0xd7e5b5,
    roughness: 0.95,
    flatShading: false,
  }));
}

function paintTerrainTile(terrain, centerX, centerZ) {
  const positions = terrain.geometry.attributes.position;
  const colors = terrain.geometry.attributes.color;
  const low = new THREE.Color('#387a3b');
  const high = new THREE.Color('#91c95d');
  const color = new THREE.Color();
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) + centerX;
    const z = positions.getZ(index) + centerZ;
    const height = terrainHeightAt(x, z);
    positions.setY(index, height);
    color.copy(low).lerp(high, THREE.MathUtils.clamp((height + 17) / 9, 0, 1));
    colors.setXYZ(index, color.r, color.g, color.b);
  }
  positions.needsUpdate = true;
  colors.needsUpdate = true;
  terrain.geometry.computeVertexNormals();
  terrain.geometry.computeBoundingSphere();
  terrain.position.set(centerX, 0, centerZ);
}

export function updateTerrainAround(terrain, worldX, worldZ) {
  const step = terrain.userData.tileSize;
  const centerX = Math.round(worldX / step) * step;
  const centerZ = Math.round(worldZ / step) * step;
  const current = terrain.userData.tileCenter;
  if (centerX === current.x && centerZ === current.y) return;

  current.set(centerX, centerZ);
  terrain.children.forEach((tile) => {
    const { x, y } = tile.userData.gridOffset;
    paintTerrainTile(tile, centerX + x * step, centerZ + y * step);
  });
}
