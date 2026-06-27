import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  AlertTriangle, Wind, Truck, Activity, Droplets, Shield, Zap, TrendingDown, CheckCircle2
} from 'lucide-react';

const pollutionSources = [
  { name: 'Transport & Road Dust', value: 35 },
  { name: 'Industrial Emissions', value: 45 },
  { name: 'Construction', value: 10 },
  { name: 'Others', value: 10 },
];

const COLORS = ['#06b6d4', '#ef4444', '#f59e0b', '#10b981'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const App = () => {
  const [currentData, setCurrentData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAQIData = async () => {
      try {
        // Fetch real-time data for Raipur
        const res = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=21.2333&longitude=81.6333&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5&timezone=Asia/Kolkata');
        
        setCurrentData(res.data.current);

        // Format hourly data for the last 24 hours up to current hour
        const currentHourStr = res.data.current.time.slice(0, 13); // "YYYY-MM-DDTHH"
        const times = res.data.hourly.time;
        const currentIndex = times.findIndex(t => t.startsWith(currentHourStr));
        
        const past24Hours = [];
        if (currentIndex !== -1) {
          const startIndex = Math.max(0, currentIndex - 23);
          for (let i = startIndex; i <= currentIndex; i++) {
            past24Hours.push({
              time: new Date(times[i]).getHours() + ':00',
              pm10: res.data.hourly.pm10[i],
              pm2_5: res.data.hourly.pm2_5[i],
            });
          }
        }
        setHourlyData(past24Hours);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching AQI data", error);
        setLoading(false);
      }
    };

    fetchAQIData();
  }, []);

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh' }}>
        <h2 className="gradient-text animate-pulse">Loading Live Data for Raipur-Bhilai...</h2>
      </div>
    );
  }

  // Format data for radar chart (Normalizing somewhat for visual purposes)
  const radarData = currentData ? [
    { subject: 'PM2.5', A: currentData.pm2_5, fullMark: 150 },
    { subject: 'PM10', A: currentData.pm10, fullMark: 200 },
    { subject: 'Ozone', A: currentData.ozone, fullMark: 100 },
    { subject: 'NO2', A: currentData.nitrogen_dioxide, fullMark: 100 },
    { subject: 'SO2', A: currentData.sulphur_dioxide, fullMark: 50 },
  ] : [];

  return (
    <div className="container">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-between mb-8"
      >
        <div>
          <h1 className="gradient-text mb-2" style={{ fontSize: '2.5rem' }}>Raipur-Bhilai EcoTransit</h1>
          <p className="text-muted">Live Heavy Vehicle Dust Reduction Dashboard</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="glass-panel" 
          style={{ textAlign: 'center', padding: '1rem 2rem' }}
        >
          <div className="stat-label">Live US AQI</div>
          <div className="stat-value text-danger flex-center gap-2">
            <Activity className="animate-pulse" />
            {currentData?.us_aqi || '--'}
          </div>
          <div className={`badge ${currentData?.us_aqi > 150 ? 'danger' : 'warning'}`}>
            {currentData?.us_aqi > 150 ? 'UNHEALTHY' : 'MODERATE'}
          </div>
        </motion.div>
      </motion.header>

      {/* Section 1: The Pain Point */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.h2 variants={itemVariants} className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
          <AlertTriangle className="text-danger" /> The Challenge: Live Data
        </motion.h2>
        
        <motion.div variants={containerVariants} className="grid-cols-3 mb-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-panel">
            <Truck className="mb-4 text-info" size={32} />
            <div className="stat-value">15,000+</div>
            <div className="stat-label">Heavy Trucks Daily</div>
            <p className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>Transporting coal, iron ore, and sponge iron.</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-panel">
            <Wind className="mb-4 text-danger" size={32} />
            <div className="stat-value">{currentData?.pm10} <span style={{fontSize: '1rem', color: '#94a3b8'}}>µg/m³</span></div>
            <div className="stat-label">Current PM10 Level</div>
            <p className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>Extremely high particulate matter due to resuspended dust.</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-panel">
            <AlertTriangle className="mb-4 text-warning" size={32} color="#f59e0b" />
            <div className="stat-value">{currentData?.pm2_5} <span style={{fontSize: '1rem', color: '#94a3b8'}}>µg/m³</span></div>
            <div className="stat-label">Current PM2.5 Level</div>
            <p className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>Fine particles from vehicle exhaust and friction.</p>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid-cols-3">
          <motion.div variants={itemVariants} className="glass-panel">
            <h3 className="mb-4">PM Pollution Sources</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pollutionSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pollutionSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-muted" style={{fontSize: '0.8rem'}}>35% attributed to Transport</div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: 'span 2' }}>
            <h3 className="mb-4">24-Hour PM Trend (µg/m³)</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pm10" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="pm2_5" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Section 2: The Solution & Radar */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 mt-8"
      >
        <h2 className="mb-6 flex-center gap-2 gradient-text" style={{ justifyContent: 'flex-start' }}>
          <Zap /> The Optimization: AeroSeal & SmartMist
        </h2>
        
        <div className="grid-cols-3">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-panel" style={{ gridColumn: 'span 2' }}>
            <div className="grid-cols-2">
              <div>
                <h3 className="mb-4 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                  <Shield className="text-success" /> Material Solution
                </h3>
                <ul className="feature-list">
                  <li>
                    <CheckCircle2 className="feature-icon" />
                    <div>
                      <strong>Coated Vinyl Tarps</strong>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>100% top load coverage, preventing wind-blown material spillage at highway speeds.</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 className="feature-icon" />
                    <div>
                      <strong>EPDM Rubber Gaskets</strong>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Tailgate seals completely stop fine particulate leakage from the back.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                  <Droplets className="text-info" /> Technology Solution
                </h3>
                <ul className="feature-list">
                  <li>
                    <CheckCircle2 className="feature-icon" />
                    <div>
                      <strong>IoT Dust Sensors</strong>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Actively monitoring particulate outflow in the vehicle's aerodynamic wake.</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 className="feature-icon" />
                    <div>
                      <strong>Micro-Misting Nozzles</strong>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sprays binder mist over rear wheels when high dust is detected, settling it instantly.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Tech Diagram Animation */}
            <div className="mt-6 tech-diagram" style={{ padding: '1rem' }}>
              <h4 className="mb-2 text-center text-muted">SmartMist Interactive Simulation</h4>
              <p className="text-center text-muted mb-4" style={{fontSize: '0.75rem'}}>Hover over the truck to activate dust suppression!</p>
              <motion.div 
                whileHover="hovered"
                initial="initial"
                className="flex-center" 
                style={{ height: '120px', position: 'relative', cursor: 'crosshair' }}
              >
                <div style={{
                  width: '150px', height: '80px', background: '#334155', borderRadius: '8px 0 0 8px',
                  borderRight: '4px solid #ef4444', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', bottom: '-15px', left: '20px', width: '30px', height: '30px', background: '#1e293b', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                  <div style={{ position: 'absolute', bottom: '-15px', right: '20px', width: '30px', height: '30px', background: '#1e293b', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                  
                  {/* Sensor Beam */}
                  <div className="sensor-beam" style={{ right: '-80px', top: '10px', height: '20px', width: '80px' }}></div>
                  
                  {/* Dust vs Mist - Controlled by hover */}
                  <motion.div variants={{
                    initial: { opacity: 1 },
                    hovered: { opacity: 0, transition: { duration: 0.5 } }
                  }}>
                    <div style={{ position: 'absolute', right: '-40px', bottom: '0', color: '#f59e0b', fontSize: '24px', animation: 'float 2s infinite' }}>☁️</div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '20px', color: '#f59e0b', fontSize: '16px', animation: 'float 1.5s infinite' }}>☁️</div>
                  </motion.div>

                  <motion.div variants={{
                    initial: { opacity: 0 },
                    hovered: { opacity: 1 }
                  }}>
                    <div className="mist-particle" style={{ right: '-10px', bottom: '-10px', animationDelay: '0s' }}></div>
                    <div className="mist-particle" style={{ right: '-20px', bottom: '0px', animationDelay: '0.2s' }}></div>
                    <div className="mist-particle" style={{ right: '-5px', bottom: '10px', animationDelay: '0.4s' }}></div>
                    <div className="mist-particle" style={{ right: '-15px', bottom: '5px', animationDelay: '0.6s' }}></div>
                  </motion.div>
                </div>
                
                <div style={{ marginLeft: '100px' }}>
                  <motion.div 
                    variants={{ initial: { opacity: 0 }, hovered: { opacity: 1 } }}
                    className="badge success"
                  >
                    System Activated!
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="glass-panel">
            <h3 className="mb-4 text-center">Live Pollutant Radar</h3>
            <p className="text-center text-muted" style={{fontSize: '0.75rem', marginBottom: '1rem'}}>Current Concentration Profile</p>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Concentration" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 3: Impact */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
          <TrendingDown className="text-success" /> Projected Impact & Cost
        </h2>
        
        <div className="grid-cols-3">
          <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ textAlign: 'center' }}>
            <div className="stat-value text-success">~60%</div>
            <div className="stat-label">Reduction in Wake Dust</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ textAlign: 'center' }}>
            <div className="stat-value text-info">₹ 45,000</div>
            <div className="stat-label">Est. Cost Per Vehicle</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ textAlign: 'center' }}>
            <div className="stat-value text-warning">6 Months</div>
            <div className="stat-label">Pilot Implementation Timeline</div>
          </motion.div>
        </div>
      </motion.section>
      
      <footer className="text-center text-muted mb-8" style={{ fontSize: '0.875rem' }}>
        Dashboard designed for the Raipur-Bhilai environmental optimization initiative.
      </footer>
    </div>
  );
};

export default App;
