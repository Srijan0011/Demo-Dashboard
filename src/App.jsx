import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  AlertTriangle, Wind, Truck, Activity, Droplets, Shield, Zap, TrendingDown, CheckCircle2, Thermometer, Droplet, MapPin
} from 'lucide-react';

const pollutionSources = [
  { name: 'Transport & Road Dust', value: 35 },
  { name: 'Industrial Emissions', value: 45 },
  { name: 'Construction', value: 10 },
  { name: 'Others', value: 10 },
];

const COLORS = ['#5E6AD2', '#EF4444', '#F59E0B', '#10B981'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
};

const LOCATIONS = {
  'Raipur': { lat: 21.2514, lon: 81.6296 },
  'Bhilai': { lat: 21.1938, lon: 81.3509 }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <p className="text-muted mb-2" style={{ fontSize: '12px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color, fontSize: '14px', margin: '4px 0' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const App = () => {
  const [activeLocation, setActiveLocation] = useState('Raipur');
  const [currentAQI, setCurrentAQI] = useState(null);
  const [hourlyAQI, setHourlyAQI] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { lat, lon } = LOCATIONS[activeLocation];
        
        // Fetch AQI
        const aqiRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5&timezone=Asia/Kolkata`);
        setCurrentAQI(aqiRes.data.current);

        // Fetch Weather
        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia/Kolkata`);
        setWeatherData(weatherRes.data.current);

        // Format hourly data
        const currentHourStr = aqiRes.data.current.time.slice(0, 13);
        const times = aqiRes.data.hourly.time;
        const currentIndex = times.findIndex(t => t.startsWith(currentHourStr));
        
        const past24Hours = [];
        if (currentIndex !== -1) {
          const startIndex = Math.max(0, currentIndex - 23);
          for (let i = startIndex; i <= currentIndex; i++) {
            past24Hours.push({
              time: new Date(times[i]).getHours() + ':00',
              pm10: aqiRes.data.hourly.pm10[i],
              pm2_5: aqiRes.data.hourly.pm2_5[i],
            });
          }
        }
        setHourlyAQI(past24Hours);
      } catch (error) {
        console.error("Error fetching data", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [activeLocation]);

  // Handle panel mouse move for interactive radial gradient
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  const radarData = currentAQI ? [
    { subject: 'PM2.5', A: currentAQI.pm2_5, fullMark: 150 },
    { subject: 'PM10', A: currentAQI.pm10, fullMark: 200 },
    { subject: 'Ozone', A: currentAQI.ozone, fullMark: 100 },
    { subject: 'NO2', A: currentAQI.nitrogen_dioxide, fullMark: 100 },
    { subject: 'SO2', A: currentAQI.sulphur_dioxide, fullMark: 50 },
  ] : [];

  return (
    <div className="container">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-between mb-8"
      >
        <div>
          <h1 className="mb-2" style={{ fontSize: '2rem' }}>EcoTransit Control</h1>
          <p className="text-muted">Heavy Vehicle Environmental Impact Dashboard</p>
        </div>
        
        <div className="flex-center gap-4">
          <div className="tab-container">
            {Object.keys(LOCATIONS).map(loc => (
              <button 
                key={loc}
                className={`tab ${activeLocation === loc ? 'active' : ''}`}
                onClick={() => setActiveLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <Activity className="animate-pulse" size={32} style={{ color: 'var(--text-secondary)' }} />
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          
          {/* Environment Overview (Weather & AQI) */}
          <div className="grid-cols-4 mb-8">
            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <div className="flex-between mb-4">
                <span className="stat-label flex-start gap-2"><Activity size={14} /> US AQI</span>
                <span className={`badge ${currentAQI?.us_aqi > 150 ? 'danger' : currentAQI?.us_aqi > 100 ? 'warning' : 'success'}`}>
                  {currentAQI?.us_aqi > 150 ? 'Unhealthy' : currentAQI?.us_aqi > 100 ? 'Moderate' : 'Good'}
                </span>
              </div>
              <div className="stat-value">{currentAQI?.us_aqi || '--'}</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <div className="stat-label flex-start gap-2 mb-4"><Thermometer size={14} /> Temperature</div>
              <div className="stat-value">{weatherData?.temperature_2m}<span className="stat-unit">°C</span></div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <div className="stat-label flex-start gap-2 mb-4"><Droplet size={14} /> Humidity</div>
              <div className="stat-value">{weatherData?.relative_humidity_2m}<span className="stat-unit">%</span></div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <div className="stat-label flex-start gap-2 mb-4"><Wind size={14} /> Wind Speed</div>
              <div className="stat-value">{weatherData?.wind_speed_10m}<span className="stat-unit">km/h</span></div>
            </motion.div>
          </div>

          {/* Section 1: The Challenge */}
          <motion.div variants={itemVariants} className="flex-start gap-2 mb-4 text-muted">
            <AlertTriangle size={16} /> <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>Live Particulate Data</h2>
          </motion.div>
          
          <div className="grid-cols-3 mb-8">
            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove} style={{ gridColumn: 'span 2' }}>
              <div className="flex-between mb-6">
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>24-Hour PM Trend</h3>
                  <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Hourly concentration in µg/m³</p>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyAQI} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Line type="monotone" name="PM10" dataKey="pm10" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#EF4444', stroke: '#000', strokeWidth: 2 }} />
                    <Line type="monotone" name="PM2.5" dataKey="pm2_5" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#F59E0B', stroke: '#000', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <h3 className="mb-2" style={{ fontSize: '1.25rem' }}>Current Levels</h3>
              <p className="text-muted mb-6" style={{ fontSize: '0.8125rem' }}>Primary transport pollutants</p>
              
              <div className="mb-6">
                <div className="flex-between mb-2">
                  <span className="text-muted text-sm" style={{ fontSize: '0.875rem' }}>PM10 (Dust)</span>
                  <span className="text-danger font-medium">{currentAQI?.pm10} µg/m³</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((currentAQI?.pm10 / 200) * 100, 100)}%`, background: 'var(--danger)' }}></div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex-between mb-2">
                  <span className="text-muted text-sm" style={{ fontSize: '0.875rem' }}>PM2.5 (Exhaust)</span>
                  <span className="text-warning font-medium">{currentAQI?.pm2_5} µg/m³</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((currentAQI?.pm2_5 / 100) * 100, 100)}%`, background: 'var(--warning)' }}></div>
                </div>
              </div>

              <h3 className="mb-4" style={{ fontSize: '1rem', marginTop: '2rem' }}>Pollution Sources</h3>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pollutionSources} cx="50%" cy="50%" innerRadius={40} outerRadius={60} stroke="none" dataKey="value">
                      {pollutionSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Section 2: Solution */}
          <motion.div variants={itemVariants} className="flex-start gap-2 mb-4 mt-8 text-muted">
            <Zap size={16} /> <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>System Optimization</h2>
          </motion.div>
          
          <div className="grid-cols-2 mb-8">
            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <h3 className="mb-6 flex-start gap-2" style={{ fontSize: '1.25rem' }}>
                <Shield size={18} className="text-info" /> Mitigation Tech
              </h3>
              <ul className="feature-list">
                <li>
                  <CheckCircle2 size={16} className="feature-icon" />
                  <div>
                    <strong style={{ fontSize: '0.9375rem', display: 'block', marginBottom: '4px' }}>Coated Vinyl Tarps</strong>
                    <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>100% top load coverage, preventing wind-blown material spillage at highway speeds.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-icon" />
                  <div>
                    <strong style={{ fontSize: '0.9375rem', display: 'block', marginBottom: '4px' }}>IoT Dust Sensors</strong>
                    <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>Actively monitoring particulate outflow in the vehicle's aerodynamic wake.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-icon" />
                  <div>
                    <strong style={{ fontSize: '0.9375rem', display: 'block', marginBottom: '4px' }}>Micro-Misting Nozzles</strong>
                    <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>Sprays binder mist over rear wheels when high dust is detected, settling it instantly.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel" onMouseMove={handleMouseMove}>
              <h3 className="mb-2 text-center" style={{ fontSize: '1.25rem' }}>SmartMist Interactive Simulation</h3>
              <p className="text-center text-muted mb-6" style={{fontSize: '0.8125rem'}}>Hover to activate suppression system</p>
              
              <div className="tech-diagram flex-center" style={{ height: '220px' }}>
                <motion.div 
                  whileHover="hovered"
                  initial="initial"
                  className="flex-center" 
                  style={{ position: 'relative', cursor: 'crosshair', width: '100%', height: '100%' }}
                >
                  {/* Truck Body */}
                  <div style={{
                    width: '140px', height: '60px', background: '#27272A', borderRadius: '4px 0 0 4px',
                    borderRight: '3px solid var(--danger)', position: 'relative', zIndex: 2
                  }}>
                    {/* Wheels */}
                    <div style={{ position: 'absolute', bottom: '-12px', left: '16px', width: '24px', height: '24px', background: '#09090B', borderRadius: '50%', border: '2px solid #52525B' }}></div>
                    <div style={{ position: 'absolute', bottom: '-12px', right: '16px', width: '24px', height: '24px', background: '#09090B', borderRadius: '50%', border: '2px solid #52525B' }}></div>
                    
                    <div className="sensor-beam" style={{ right: '-90px', top: '10px', height: '20px', width: '90px', zIndex: 1 }}></div>
                    
                    {/* Dust (Default state) */}
                    <motion.div variants={{
                      initial: { opacity: 1 },
                      hovered: { opacity: 0, transition: { duration: 0.3 } }
                    }}>
                      <div style={{ position: 'absolute', right: '-40px', bottom: '-10px', color: 'rgba(245, 158, 11, 0.4)', fontSize: '24px', animation: 'float 2s infinite', filter: 'blur(1px)' }}>☁️</div>
                      <div style={{ position: 'absolute', right: '-20px', bottom: '10px', color: 'rgba(245, 158, 11, 0.4)', fontSize: '18px', animation: 'float 1.5s infinite', filter: 'blur(1px)' }}>☁️</div>
                    </motion.div>

                    {/* Mist (Hover state) */}
                    <motion.div variants={{
                      initial: { opacity: 0 },
                      hovered: { opacity: 1, transition: { duration: 0.2 } }
                    }}>
                      <div className="mist-particle" style={{ right: '-15px', bottom: '-5px', animationDelay: '0s' }}></div>
                      <div className="mist-particle" style={{ right: '-25px', bottom: '5px', animationDelay: '0.2s' }}></div>
                      <div className="mist-particle" style={{ right: '-10px', bottom: '15px', animationDelay: '0.4s' }}></div>
                      <div className="mist-particle" style={{ right: '-30px', bottom: '10px', animationDelay: '0.6s' }}></div>
                      <div className="mist-particle" style={{ right: '-20px', bottom: '20px', animationDelay: '0.8s' }}></div>
                    </motion.div>
                  </div>
                  
                  <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                    <motion.div 
                      variants={{ initial: { opacity: 0, scale: 0.9 }, hovered: { opacity: 1, scale: 1 } }}
                      className="badge success"
                    >
                      <Zap size={12} /> Activated
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
        </motion.div>
      )}
    </div>
  );
};

export default App;
