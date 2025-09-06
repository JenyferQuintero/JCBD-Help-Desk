import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/HomeAdmiPage.module.css";

const HomeTecnicoPage = () => {
  // Estados
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState("personal");
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
    encuesta: []
  });
  const [globalStats, setGlobalStats] = useState({
    tickets: [],
    problemas: []
  });
  const [allTickets, setAllTickets] = useState([]);
  
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

  // Obtener tickets del técnico (asignados y resueltos)
  useEffect(() => {
    const fetchTicketsTecnico = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/usuarios/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            usuario_id: userId,
            rol: userRole
          }
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

        setTableData({
          asignados,
          resueltos,
          encuesta: resueltos // Para ejemplo, todos los resueltos tienen encuesta pendiente
        });
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
        const response = await axios.get("http://localhost:5000/usuarios/estado_tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const tickets = response.data;
        setAllTickets(tickets);
        
        // Debug: verificar estructura de datos
        console.log("Datos de tickets recibidos:", tickets);
        
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
          encuesta: tickets.filter(t => 
            (t.estado_ticket?.toLowerCase() === 'encuesta' || 
             t.estado?.toLowerCase() === 'encuesta')
          ).length
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
    navigate(`/tickets/solucion/${ticket.id}`);
  };

  // Obtener datos para la tabla global según el estado - CORREGIDO
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
        return allTickets.filter(t => 
          (t.estado_ticket?.toLowerCase() === 'encuesta' || 
           t.estado?.toLowerCase() === 'encuesta')
        );
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
              <Link to="/HomeTecnicoPage" className={styles.linkSinSubrayado}>
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
                
                {renderPersonalTable(tableData.encuesta, "ENCUESTA DE SATISFACCIÓN", 
                  ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "ENCUESTA REALIZADA", "CALIFICACIÓN"])}
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
                  
                  {renderPersonalTable(tableData.resueltos, "SUS CASOS RESUELTOS", 
                    ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "UBICACION", "FECHA CIERRE"])}
                  
                  {renderPersonalTable(tableData.encuesta, "ENCUESTA DE SATISFACCIÓN", 
                    ["ID TICKET", "SOLICITANTE", "DESCRIPCIÓN", "ENCUESTA REALIZADA", "CALIFICACIÓN"])}
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

export default HomeTecnicoPage;
