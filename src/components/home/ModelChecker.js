import { useGLTF } from '@react-three/drei'
import React from 'react'

export default function ModelChecker() {
  const { nodes, materials } = useGLTF('/models/tshirt.glb')
  React.useEffect(() => {
    console.log('Nodes:', Object.keys(nodes))
    console.log('Materials:', Object.keys(materials))
  }, [nodes, materials])
  return null
}
