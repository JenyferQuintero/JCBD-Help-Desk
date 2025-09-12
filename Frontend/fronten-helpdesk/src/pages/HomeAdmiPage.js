import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/HomeAdmiPage.module.css";

// Datos de ejemplo para el dashboard
const demoStats = {
  users: {
    total: 142,
    active: 128,
    inactive: 14,
    distribution: [
      { name: 'Administradores', value: 8 },
      { name: 'Agentes', value: 32 },
      { name: 'Usuarios', value: 102 }
    ]
  },
  tickets: {
    total: 356,
    open: 142,
    resolved: 214,
    byStatus: [
      { name: 'Abierto', value: 142 },
      { name: 'En progreso', value: 87 },
      { name: 'Resuelto', value: 214 },
      { name: 'Cerrado', value: 198 }
    ],
    trend: Array.from({length: 30}, (_, i) => ({
      date: `${i+1}/06`,
      created: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 18) + 3
    }))
  },
  surveys: {
    total: 287,
    completed: 214,
    pending: 73
  },
  entities: [
    { name: 'Sede Principal', value: 124 },
    { name: 'Sede Norte', value: 87 },
    { name: 'Sede Sur', value: 65 },
    { name: 'Oficina Este', value: 42 }
  ]
};

const Dashboard = () => {
  const [stats, setStats] = useState(demoStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando estadísticas...</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorContainer}>
      <p>Error al cargar los datos: {error}</p>
      <button onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2>Tablero de Estadísticas</h2>
        <div className={styles.timeRangeSelector}>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.timeRangeSelect}
          >
            <option value="day">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <h3>Usuarios</h3>
          <p className={styles.statValue}>{stats.users.total}</p>
          <div className={styles.statBreakdown}>
            <span>Activos: {stats.users.active}</span>
            <span>Inactivos: {stats.users.inactive}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3>Tickets</h3>
          <p className={styles.statValue}>{stats.tickets.total}</p>
          <div className={styles.statBreakdown}>
            <span>Abiertos: {stats.tickets.open}</span>
            <span>Resueltos: {stats.tickets.resolved}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3>Encuestas</h3>
          <p className={styles.statValue}>{stats.surveys.total}</p>
          <div className={styles.statBreakdown}>
            <span>Completadas: {stats.surveys.completed}</span>
            <span>Pendientes: {stats.surveys.pending}</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Distribución de Usuarios</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.users.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.users.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} usuarios`, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Tickets por Estado</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.tickets.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Tendencia de Tickets ({timeRange === 'month' ? 'Últimos 30 días' : 'Últimos 12 meses'})</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.tickets.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Cantidad']} />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#8884d8" name="Creados" />
                <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resueltos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Entidades con más Tickets</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.entities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeAdmiPage = () => {
  // Estados
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState("global");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState({
    type: null,
    value: null
  });
  const [tableData, setTableData] = useState({
    asignados: [],
    resueltos: [],
    encuesta: [],
    todasLasEncuestas: []
  });
  const [globalStats, setGlobalStats] = useState({
    tickets: [],
    problemas: []
  });
  const [allTickets, setAllTickets] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  
  const navigate = useNavigate();

  // Obtener datos del usuario
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol") || "";
  const userId = localStorage.getItem("id_usuario");

  // Handlers
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleSupport = () => {
    setIsSupportOpen(!isSupportOpen);
    setIsAdminOpen(false);
    setIsConfigOpen(false);
  };
  const toggleAdmin = () => {
    setIsAdminOpen(!isAdminOpen);
    setIsSupportOpen(false);
    setIsConfigOpen(false);
  };
  const toggleConfig = () => {
    setIsConfigOpen(!isConfigOpen);
    setIsSupportOpen(false);
    setIsAdminOpen(false);
  };
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Obtener tickets del técnico (asignados y resueltos) y encuestas
  useEffect(() => {
    const fetchTicketsTecnico = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Obtener tickets
        const response = await axios.get("http://localhost:5000/usuarios/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            usuario_id: userId,
            rol: userRole
          }
        });

        // Obtener encuestas de tickets asignados a este técnico
        const encuestasResponse = await axios.get(`http://localhost:5000/usuarios/encuestas/tecnico/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const tickets = response.data;
        const asignados = tickets.filter(ticket => 
          ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && 
          ticket.tecnico && ticket.tecnico.includes(nombre)
        );
        const resueltos = tickets.filter(ticket => 
          (ticket.estado === 'resuelto' || ticket.estado === 'cerrado') &&
          ticket.tecnico && ticket.tecnico.includes(nombre)
        );

        // Procesar encuestas de tickets asignados al técnico
        let encuestas = [];
        if (encuestasResponse.data.success && encuestasResponse.data.encuestas) {
          encuestas = encuestasResponse.data.encuestas.map(encuesta => ({
            id: encuesta.id_ticket,
            id_encuesta: encuesta.id_encuesta,
            solicitante: encuesta.nombre_usuario || 'Usuario',
            descripcion: `Encuesta completada - Calificación: ${encuesta.calificacion}/5 - ${encuesta.comentario || 'Sin comentario'}`,
            titulo: encuesta.titulo || `Ticket #${encuesta.id_ticket}`,
            prioridad: 'Completada',
            fecha_creacion: encuesta.fecha_encuesta,
            tecnico: nombre,
            estado: 'encuesta',
            calificacion: encuesta.calificacion,
            comentario: encuesta.comentario,
            fechaEncuesta: encuesta.fecha_encuesta,
            esEncuestaRealizada: true,
            ticket_titulo: encuesta.titulo
          }));
        }

        setTableData(prev => ({
          ...prev,
          asignados,
          resueltos,
          encuesta: encuestas
        }));
      } catch (error) {
        console.error("Error al obtener tickets del técnico:", error);
      }
    };

    if (userId && userRole && nombre) {
      fetchTicketsTecnico();
    }
  }, [userId, userRole, nombre]);

  // Obtener estadísticas globales y todos los tickets
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Obtener tickets
        const response = await axios.get("http://localhost:5000/usuarios/estado_tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const tickets = response.data;
        setAllTickets(tickets);
        
        // Obtener TODAS las encuestas (no solo las del usuario)
        const encuestasResponse = await axios.get("http://localhost:5000/usuarios/encuestas/todas", {
          headers: { Authorization: `Bearer ${token}` }
        });

        let todasLasEncuestas = [];
        if (encuestasResponse.data.success && encuestasResponse.data.encuestas) {
          todasLasEncuestas = encuestasResponse.data.encuestas.map(encuesta => ({
            id: encuesta.id_ticket,
            id_encuesta: encuesta.id_encuesta,
            solicitante: encuesta.usuario || 'Usuario',
            descripcion: `Encuesta completada - Calificación: ${encuesta.calificacion}/5 - ${encuesta.comentario || 'Sin comentario'}`,
            titulo: `Ticket #${encuesta.id_ticket} - ${encuesta.ticket_titulo || ''}`,
            prioridad: 'Completada',
            fecha_creacion: encuesta.fecha_encuesta,
            tecnico: encuesta.nombre_tecnico || 'Sin asignar',
            estado: 'encuesta',
            calificacion: encuesta.calificacion,
            comentario: encuesta.comentario,
            fechaEncuesta: encuesta.fecha_encuesta,
            esEncuestaRealizada: true,
            ticket_titulo: encuesta.ticket_titulo,
            nombre_tecnico: encuesta.nombre_tecnico
          }));
        }

        const stats = {
          nuevo: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'nuevo' || 
             t.estado?.toLowerCase() === 'nuevo' || 
             t.estado?.toLowerCase() === 'new')
          ).length,
          enProceso: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'en_proceso' || 
             t.estado_ticket?.toLowerCase() === 'en curso' || 
             t.estado?.toLowerCase() === 'en_proceso' || 
             t.estado?.toLowerCase() === 'en curso' || 
             t.estado?.toLowerCase() === 'proceso')
          ).length,
          enEspera: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'en-espera' || 
             t.estado_ticket?.toLowerCase() === 'reabierto' || 
             t.estado?.toLowerCase() === 'en-espera' || 
             t.estado?.toLowerCase() === 'reabierto' || 
             t.estado?.toLowerCase() === 'en espera')
          ).length,
          resueltos: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'resuelto' || 
             t.estado?.toLowerCase() === 'resuelto' || 
             t.estado?.toLowerCase() === 'solucionado')
          ).length,
          cerrados: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'cerrado' ||
             t.estado?.toLowerCase() === 'resuelto' || 
             t.estado?.toLowerCase() === 'cerrado')
          ).length,
          borrados: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'borrado' || 
             t.estado?.toLowerCase() === 'borrado' || 
             t.estado?.toLowerCase() === 'eliminado')
          ).length,
          encuesta: todasLasEncuestas.length
        };

        setGlobalStats({
          tickets: [
            { label: "Nuevo", color: "green", icon: "🟢", count: stats.nuevo, key: "nuevo" },
            { label: "En proceso", color: "lightgreen", icon: "⭕", count: stats.enProceso, key: "enProceso" },
            { label: "En espera", color: "orange", icon: "🟡", count: stats.enEspera, key: "enEspera" },
            { label: "Resueltas", color: "gray", icon: "⚪", count: stats.resueltos, key: "resueltos" },
            { label: "Cerrado", color: "black", icon: "⚫", count: stats.cerrados, key: "cerrados" },
            { label: "Borrado", color: "red", icon: "🗑", count: stats.borrados, key: "borrados" },
            { label: "Encuesta", color: "purple", icon: "📅", count: stats.encuesta, key: "encuesta" }
          ],
          problemas: [
            { label: "Hardware", color: "blue", icon: "💻", count: tickets.filter(t => t.categoria === 'Hardware').length },
            { label: "Software", color: "purple", icon: "📱", count: tickets.filter(t => t.categoria === 'Software').length },
            { label: "Red", color: "orange", icon: "🌐", count: tickets.filter(t => t.categoria === 'Red').length },
            { label: "Cuentas", color: "green", icon: "👤", count: tickets.filter(t => t.categoria === 'Cuentas').length }
          ]
        });

        setTableData(prev => ({
          ...prev,
          todasLasEncuestas: todasLasEncuestas
        }));

      } catch (error) {
        console.error("Error al obtener estadísticas globales:", error);
      }
    };

    fetchGlobalStats();
  }, []);

  const roleToPath = {
    usuario: '/home',
    tecnico: '/HomeTecnicoPage',
    administrador: '/HomeAdmiPage'
  };

  const getRouteByRole = (section) => {
    if (section === 'inicio') {
      return roleToPath[userRole] || '/home';
    } else if (section === 'crear-caso') {
      return userRole === 'usuario' ? '/CrearCasoUse' : '/CrearCasoAdmin';
    } else if (section === "tickets") {
      return "/Tickets";
    }
    return "/";
  };

  // Manejar clic en un ticket
  const handleTicketClick = (ticket) => {
    if (ticket.esEncuestaRealizada) {
      navigate(`/encuestas/detalle/${ticket.id_encuesta}`);
    } else {
      navigate(`/tickets/solucion/${ticket.id}`);
    }
  };

  // Obtener datos para la tabla global según el estado
  const getGlobalTableData = (tabKey) => {
    switch(tabKey) {
      case "nuevo":
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'nuevo' || 
           t.estado?.toLowerCase() === 'nuevo' || 
           t.estado?.toLowerCase() === 'new')
        );
      case "enProceso":
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'en_proceso' || 
           t.estado_ticket?.toLowerCase() === 'en curso' || 
           t.estado?.toLowerCase() === 'en_proceso' || 
           t.estado?.toLowerCase() === 'en curso' || 
           t.estado?.toLowerCase() === 'proceso')
        );
      case "enEspera":
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'en-espera' || 
           t.estado_ticket?.toLowerCase() === 'reabierto' || 
           t.estado?.toLowerCase() === 'en-espera' || 
           t.estado?.toLowerCase() === 'reabierto' || 
           t.estado?.toLowerCase() === 'en espera')
        );
      case "resueltos":
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'resuelto' || 
           t.estado?.toLowerCase() === 'resuelto' || 
           t.estado?.toLowerCase() === 'solucionado')
        );
      case "cerrados":
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'cerrado' ||
           t.estado?.toLowerCase() === 'resuelto' || 
           t.estado?.toLowerCase() === 'cerrado')
        );
      case "borrados":
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'borrado' || 
           t.estado?.toLowerCase() === 'borrado' || 
           t.estado?.toLowerCase() === 'eliminado')
        );
      case "encuesta":
        return tableData.todasLasEncuestas || [];
      case "todo":
        return allTickets;
      default:
        return [];
    }
  };

  // Obtener datos por categoría
  const getCategoryTableData = (categoryName) => {
    return allTickets.filter(t => 
      t.categoria && t.categoria.toLowerCase() === categoryName.toLowerCase()
    );
  };

  // Manejar clic en los estados
  const handleStatusClick = (statusKey) => {
    setActiveFilter(activeFilter.value === statusKey ? { type: null, value: null } : { type: 'status', value: statusKey });
  };

  // Manejar clic en las categorías
  const handleCategoryClick = (categoryName) => {
    setActiveFilter(activeFilter.value === categoryName ? { type: null, value: null } : { type: 'category', value: categoryName });
  };

  // Manejar clic en las pestañas
  const handleTabClick = (tabKey) => {
    setActiveTab(activeTab === tabKey ? null : tabKey);
  };

  // Renderizar tablas para Vista Personal
  const renderPersonalTable = (data, title, columns) => {
    if (!data || data.length === 0) {
      return (
        <div className={styles.tablaContainer}>
          <h2>{title}</h2>
          <p>No hay tickets en este estado.</p>
        </div>
      );
    }

    return (
      <div className={styles.tablaContainer}>
        <h2>{title}</h2>
        <table>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} onClick={() => handleTicketClick(item)} className={styles.clickableRow}>
                <td>#{item.id}</td>
                <td>{item.solicitante}</td>
                <td>{item.descripcion}</td>
                <td>{item.ubicacion}</td>
                {columns.includes('ESTADO') && <td>{item.estado}</td>}
                {columns.includes('FECHA CIERRE') && <td>{item.fecha_cierre || 'N/A'}</td>}
                {columns.includes('CALIFICACIÓN') && <td>{item.calificacion || 'Pendiente'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar tabla para Vista Global
  const renderGlobalTable = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className={styles.tablaContainer}>
          <h2>{title}</h2>
          <p>No hay tickets en este estado.</p>
        </div>
      );
    }

    return (
      <div className={styles.tablaContainer}>
        <h2>{title}</h2>
        <table>
          <thead>
            <tr>
              <th>ID TICKET</th>
              <th>SOLICITANTE</th>
              <th>DESCRIPCIÓN</th>
              <th>UBICACION</th>
              <th>ESTADO</th>
              <th>TÉCNICO</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} onClick={() => handleTicketClick(item)} className={styles.clickableRow}>
                <td>#{item.id}</td>
                <td>{item.solicitante}</td>
                <td>{item.descripcion}</td>
                <td>{item.ubicacion}</td>
                <td>{item.estado || item.estado_ticket}</td>
                <td>{item.tecnico || 'Sin asignar'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar tabla de encuestas personales (NO CLICKEABLES)
const renderSurveyTable = (data, title) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.tablaContainer}>
        <h2>{title}</h2>
        <p>No hay encuestas de usuarios para tus tickets.</p>
      </div>
    );
  }

  return (
    <div className={styles.tablaContainer}>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>ID TICKET</th>
            <th>USUARIO</th>
            <th>CALIFICACIÓN</th>
            <th>COMENTARIO</th>
            <th>FECHA ENCUESTA</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={styles.nonClickableRow}>
              <td>#{item.id}</td>
              <td>{item.solicitante}</td>
              <td>
                <span className={styles.calificacion} style={{ 
                }}>
                  {item.calificacion}/5
                </span>
              </td>
              <td>{item.comentario || 'Sin comentario'}</td>
              <td>{item.fechaEncuesta ? new Date(item.fechaEncuesta).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  // Renderizar tabla de encuestas globales (NO CLICKEABLE)
  const renderGlobalSurveyTable = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className={styles.tablaContainer}>
          <h2>{title}</h2>
          <p>No hay encuestas registradas.</p>
        </div>
      );
    }

    return (
      <div className={styles.tablaContainer}>
        <h2>{title}</h2>
        <table>
          <thead>
            <tr>
              <th>ID TICKET</th>
              <th>SOLICITANTE</th>
              <th>TÉCNICO</th>
              <th>CALIFICACIÓN</th>
              <th>COMENTARIO</th>
              <th>FECHA ENCUESTA</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className={styles.nonClickableRow}>
                <td>#{item.id}</td>
                <td>{item.solicitante}</td>
                <td>{item.nombre_tecnico || 'Sin asignar'}</td>
                <td>{item.calificacion}/5</td>
                <td>{item.comentario || 'Sin comentario'}</td>
                <td>{item.fechaEncuesta ? new Date(item.fechaEncuesta).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar menú según el rol
  const renderMenuByRole = () => {
    switch (userRole) {
      case 'administrador':
        return (
          <ul className={styles.menuIconos}>
            <li className={styles.iconosMenu}>
              <Link to="/HomeAdmiPage" className={styles.linkSinSubrayado}>
                <FcHome className={styles.menuIcon} />
                <span className={styles.menuText}>Inicio</span>
              </Link>
            </li>

            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleSupport}>
                <FcAssistant className={styles.menuIcon} />
                <span className={styles.menuText}> Soporte</span>
              </div>
              <ul className={`${styles.submenu} ${isSupportOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Tickets" className={styles.submenuLink}>
                    <FcAnswers className={styles.menuIcon} />
                    <span className={styles.menuText}>Tickets</span>
                  </Link>
                </li>
                <li>
                  <Link to="/CrearCasoAdmin" className={styles.submenuLink}>
                    <FcCustomerSupport className={styles.menuIcon} />
                    <span className={styles.menuText}>Crear Caso</span>
                  </Link>
                </li>
                
                <li>
                  <Link to="/Estadisticas" className={styles.submenuLink}>
                    <FcBullish className={styles.menuIcon} />
                    <span className={styles.menuText}>Estadísticas</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleAdmin}>
                <FcBusinessman className={styles.menuIcon} />
                <span className={styles.menuText}> Administración</span>
              </div>
              <ul className={`${styles.submenu} ${isAdminOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Usuarios" className={styles.submenuLink}>
                    <FcPortraitMode className={styles.menuIcon} />
                    <span className={styles.menuText}> Usuarios</span>
                  </Link>
                </li>
                <li>
                  <Link to="/Grupos" className={styles.submenuLink}>
                    <FcConferenceCall className={styles.menuIcon} />
                    <span className={styles.menuText}> Grupos</span>
                  </Link>
                </li>
                <li>
                  <Link to="/Entidades" className={styles.submenuLink}>
                    <FcOrganization className={styles.menuIcon} />
                    <span className={styles.menuText}> Entidades</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleConfig}>
                <FcAutomatic className={styles.menuIcon} />
                <span className={styles.menuText}> Configuración</span>
              </div>
              <ul className={`${styles.submenu} ${isConfigOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Categorias" className={styles.submenuLink}>
                    <FcGenealogy className={styles.menuIcon} />
                    <span className={styles.menuText}>Categorias</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        );

      case 'tecnico':
        return (
          <ul className={styles.menuIconos}>
            <li className={styles.iconosMenu}>
              <Link to="/HomeAdmiPage" className={styles.linkSinSubrayado}>
                <FcHome className={styles.menuIcon} />
                <span className={styles.menuText}>Inicio</span>
              </Link>
            </li>

            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleSupport}>
                <FcAssistant className={styles.menuIcon} />
                <span className={styles.menuText}> Soporte</span>
              </div>
              <ul className={`${styles.submenu} ${isSupportOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Tickets" className={styles.submenuLink}>
                    <FcAnswers className={styles.menuIcon} />
                    <span className={styles.menuText}>Tickets</span>
                  </Link>
                </li>
                <li>
                  <Link to="/CrearCasoAdmin" className={styles.submenuLink}>
                    <FcCustomerSupport className={styles.menuIcon} />
                    <span className={styles.menuText}>Crear Caso</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleAdmin}>
                <FcBusinessman className={styles.menuIcon} />
                <span className={styles.menuText}> Administración</span>
              </div>
              <ul className={`${styles.submenu} ${isAdminOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Usuarios" className={styles.submenuLink}>
                    <FcPortraitMode className={styles.menuIcon} />
                    <span className={styles.menuText}> Usuarios</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        );

      case 'usuario':
      default:
        return (
          <ul className={styles.menuIconos}>
            <li className={styles.iconosMenu}>
              <Link to="/home" className={styles.linkSinSubrayado}>
                <FcHome className={styles.menuIcon} />
                <span className={styles.menuText}>Inicio</span>
              </Link>
            </li>

            <li className={styles.iconosMenu}>
              <Link to="/CrearCasoUse" className={styles.linkSinSubrayado}>
                <FcCustomerSupport className={styles.menuIcon} />
                <span className={styles.menuText}>Crear Caso</span>
              </Link>
            </li>

            <li className={styles.iconosMenu}>
              <Link to="/Tickets" className={styles.linkSinSubrayado}>
                <FcAnswers className={styles.menuIcon} />
                <span className={styles.menuText}>Tickets</span>
                </Link>
            </li>
          </ul>
        );
    }
  };

  return (
    <div className={styles.containerPrincipal}>
      {/* Menú Vertical */}
      <aside
        className={`${styles.menuVertical} ${isMenuExpanded ? styles.expanded : ""}`}
        onMouseEnter={() => setIsMenuExpanded(true)}
        onMouseLeave={() => setIsMenuExpanded(false)}
      >
        <div className={styles.containerFluidMenu}>
          <div className={styles.logoContainer}>
            <img src={Logo} alt="Logo" />
          </div>

          <button
            className={`${styles.menuButton} ${styles.mobileMenuButton}`}
            type="button"
            onClick={toggleMobileMenu}
          >
            <FiAlignJustify className={styles.menuIcon} />
          </button>

          <div className={`${styles.menuVerticalDesplegable} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
            {renderMenuByRole()}
          </div>

          <div className={styles.floatingContainer}>
            <div className={styles.menuLogoEmpresarial}>
              <img src={Logoempresarial} alt="Logo Empresarial" />
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div style={{ marginLeft: isMenuExpanded ? "200px" : "60px", transition: "margin-left 0.3s ease" }}>
        <Outlet />
      </div>

      {/* Header */}
      <header className={styles.containerInicio} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        <div className={styles.containerInicioImg}>
          <Link to={roleToPath[userRole] || '/home'} className={styles.linkSinSubrayado}>
            <span>Inicio</span>
          </Link>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.searchContainer}>
            <input
              className={styles.search}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className={styles.buttonBuscar}
              title="Buscar"
              disabled={isLoading || !searchTerm.trim()}
            >
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
            {isLoading && <span className={styles.loading}>Buscando...</span>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.userContainer}>
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{nombre}</span></span>
            <div className={styles.iconContainer}>
              <Link to="/">
                <FaPowerOff className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className={styles.containerHomeAdmiPage} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        <main>
          <div className={styles.flexColumna}>
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.flexColumnHorizontal}>
                  <div className={styles.viewButtonsContainer}>
                    <button
                      className={`${styles.viewButton} ${activeView === "personal" ? styles.active : ""}`}
                      onClick={() => setActiveView("personal")}
                    >
                      Vista Personal
                    </button>
                    <button
                      className={`${styles.viewButton} ${activeView === "global" ? styles.active : ""}`}
                      onClick={() => setActiveView("global")}
                    >
                      Vista Global
                    </button>
                    <button
                      className={`${styles.viewButton} ${activeView === "todo" ? styles.active : ""}`}
                      onClick={() => setActiveView("todo")}
                    >
                      Todo
                    </button>
                    <button
                      className={`${styles.viewButton} ${activeView === "dashboard" ? styles.active : ""}`}
                      onClick={() => setActiveView("dashboard")}
                    >
                      Tablero
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="app-container">
            {/* Vista Personal */}
            {activeView === "personal" && (
              <>
                {renderPersonalTable(tableData.asignados, "SUS CASOS ASIGNADOS", 
                  ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "UBICACION", "ESTADO"])}
                
                {renderPersonalTable(tableData.resueltos, "SUS CASOS RESUELTOS", 
                  ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "UBICACION", "FECHA CIERRE"])}
                
                {renderSurveyTable(tableData.encuesta, "ENCUESTAS DE SATISFACCIÓN DE TUS USUARIOS")}
              </>
            )}

            {/* Vista Global */}
            {activeView === "global" && (
              <>
                <div className={styles.sectionContainer}>
                  <h2>Tickets</h2>
                  <div className={styles.cardsContainer}>
                    {globalStats.tickets.map((ticket, index) => (
                      <div 
                        key={index} 
                        className={`${styles.card} ${activeFilter.type === 'status' && activeFilter.value === ticket.key ? styles.activeCard : ""}`} 
                        style={{ borderColor: ticket.color }}
                        onClick={() => handleStatusClick(ticket.key)}
                      >
                        <span className={styles.icon}>{ticket.icon}</span>
                        <span className={styles.label}>{ticket.label}</span>
                        <span className={styles.count}>{ticket.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.sectionContainer}>
                  <h2>Problemas por Categoría</h2>
                  <div className={styles.cardsContainer}>
                    {globalStats.problemas.map((problema, index) => (
                      <div 
                        key={index} 
                        className={`${styles.card} ${activeFilter.type === 'category' && activeFilter.value === problema.label ? styles.activeCard : ""}`} 
                        style={{ borderColor: problema.color }}
                        onClick={() => handleCategoryClick(problema.label)}
                      >
                        <span className={styles.icon}>{problema.icon}</span>
                        <span className={styles.label}>{problema.label}</span>
                        <span className={styles.count}>{problema.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mostrar tabla cuando se hace clic en un estado o categoría */}
                {activeFilter.type && (
                  activeFilter.type === 'status' && activeFilter.value === 'encuesta' ? 
                    renderGlobalSurveyTable(
                      getGlobalTableData(activeFilter.value),
                      `ENCUESTAS DE SATISFACCIÓN - TODOS LOS USUARIOS`
                    )
                    :
                    renderGlobalTable(
                      activeFilter.type === 'status' 
                        ? getGlobalTableData(activeFilter.value) 
                        : getCategoryTableData(activeFilter.value),
                      activeFilter.type === 'status' 
                        ? `TICKETS - ${activeFilter.value.toUpperCase()}` 
                        : `TICKETS - CATEGORÍA ${activeFilter.value.toUpperCase()}`
                    )
                )}
              </>
            )}

            {/* Vista Todo - Muestra ambas vistas */}
            {activeView === "todo" && (
              <>
                {/* Vista Personal en Todo */}
                <div className={styles.sectionContainer}>
                  <h2>Vista Personal</h2>
                  {renderPersonalTable(tableData.asignados, "SUS CASOS ASIGNADOS", 
                    ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "UBICACION", "ESTADO"])}
                  
                  {renderPersonalTable(tableData.resueltos, "SUS CASOS RESuELTOS", 
                    ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "UBICACION", "FECHA CIERRE"])}
                  
                  {renderSurveyTable(tableData.encuesta, "ENCUESTAS DE SATISFACCIÓN DE TUS USUARIOS")}
                </div>

                {/* Vista Global en Todo */}
                <div className={styles.sectionContainer}>
                  <h2>Vista Global - Tickets</h2>
                  <div className={styles.cardsContainer}>
                    {globalStats.tickets.map((ticket, index) => (
                      <div 
                        key={index} 
                        className={`${styles.card} ${activeFilter.type === 'status' && activeFilter.value === ticket.key ? styles.activeCard : ""}`} 
                        style={{ borderColor: ticket.color }}
                        onClick={() => handleStatusClick(ticket.key)}
                      >
                        <span className={styles.icon}>{ticket.icon}</span>
                        <span className={styles.label}>{ticket.label}</span>
                        <span className={styles.count}>{ticket.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.sectionContainer}>
                  <h2>Vista Global - Problemas por Categoría</h2>
                  <div className={styles.cardsContainer}>
                    {globalStats.problemas.map((problema, index) => (
                      <div 
                        key={index} 
                        className={`${styles.card} ${activeFilter.type === 'category' && activeFilter.value === problema.label ? styles.activeCard : ""}`} 
                        style={{ borderColor: problema.color }}
                        onClick={() => handleCategoryClick(problema.label)}
                      >
                        <span className={styles.icon}>{problema.icon}</span>
                        <span className={styles.label}>{problema.label}</span>
                        <span className={styles.count}>{problema.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mostrar tabla cuando se hace clic en un estado o categoría en la vista Todo */}
                {activeFilter.type && (
                  activeFilter.type === 'status' && activeFilter.value === 'encuesta' ? 
                    renderGlobalSurveyTable(
                      getGlobalTableData(activeFilter.value),
                      `ENCUESTAS DE SATISFACCIÓN - TODOS LOS USUARIOS`
                    )
                    :
                    renderGlobalTable(
                      activeFilter.type === 'status' 
                        ? getGlobalTableData(activeFilter.value) 
                        : getCategoryTableData(activeFilter.value),
                      activeFilter.type === 'status' 
                        ? `TICKETS - ${activeFilter.value.toUpperCase()}` 
                        : `TICKETS - CATEGORÍA ${activeFilter.value.toUpperCase()}`
                    )
                )}
              </>
            )}

            {/* Vista Tablero */}
            {activeView === "dashboard" && <Dashboard />}
          </div>
        </main>
      </div>

      {/* Chatbot */}
      <div className={styles.chatbotContainer}>
        <img
          src={ChatbotIcon}
          alt="Chatbot"
          className={styles.chatbotIcon}
          onClick={toggleChat}
        />
        {isChatOpen && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <h4>Chat de Soporte</h4>
              <button onClick={toggleChat} className={styles.closeChat}>
                &times;
              </button>
            </div>
            <div className={styles.chatBody}>
              <p>Bienvenido al chat de soporte. ¿En qué podemos ayudarte?</p>
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Escribe un mensaje..." />
              <button>Enviar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeAdmiPage;
