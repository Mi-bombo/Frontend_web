import React from 'react'
import { BienvenidaHero } from '../../components/Home/bienvenidaHero'
import { Caracteristicas } from '../../components/Home/caracteristicas'
import { FooterEmpresa } from '../../components/Home/FooterEmpresa'

const Home: React.FC = () => (
    
  <div className="flex flex-col min-h-screen bg-linear-to-br from-blue-100 to-green-50">
    <BienvenidaHero />
    <Caracteristicas />
    <FooterEmpresa />
  </div>
)

export default Home;
