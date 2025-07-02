import React, { useState, useEffect } from "react";
import axios from "axios";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/HomePage.module.css";

const Breadcrumbs = () => {
  const location = useLocation();

  // Mapeo completo de rutas a nombres legibles
  const pathNameMap = {
    home: "Inicio",
    CrearCasoUse: "Crear Caso",
    Tickets: "Tickets",
    EncuestaSatisfaccion: "Encuesta de Satisfacción",
    SolucionTickets: "Solución de Tickets",
    // Agrega más rutas según necesites
  };

  // Función para formatear nombres de ruta
  const formatCrumbName = (crumb) => {
    // Primero verifica si está en el mapeo
    if (pathNameMap[crumb]) return pathNameMap[crumb];

    // Lógica para rutas dinámicas (como IDs)
    if (/^\d+$/.test(crumb)) return `#${crumb}`;

    // Formato por defecto: reemplaza guiones y capitaliza
    return crumb.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  let currentLink = "";
  const crumbs = location.pathname
    .split("/")
    .filter((crumb) => crumb !== "")
    .map((crumb, index, array) => {
      currentLink += `/${crumb}`;

      // Es el último elemento? (no será clickable)
      const isLast = index === array.length - 1;

      return (
        <div className={styles.crumb} key={crumb}>
          {isLast ? (
            <span>{formatCrumbName(crumb)}</span>
          ) : (
            <Link to={currentLink}>{formatCrumbName(crumb)}</Link>
          )}
          {!isLast && <span className={styles.separator}>/</span>}
        </div>
      );
    });

  return (
    <div className={styles.breadcrumbs}>
      {crumbs.length > 0 ? (
        <>
          <div className={styles.crumb}>
            <Link to="/home">Inicio</Link>
            {crumbs.length > 0 && <span className={styles.separator}>/</span>}
          </div>
          {crumbs}
        </>
      ) : (
        <div className={styles.crumb}>
          <span>Inicio</span>
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado añadido
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [searchResults, setSearchResults] = useState([]); // Estado añadido para resultados
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();
  const [tableData, setTableData] = useState({
    nuevo: [],
    enCurso: [],
    enEspera: [],
    resueltos: [],
    cerrados: [],
    borrados: [],
    encuesta: [],
  });

  const handleTicketClick = (ticket) => {
    navigate("/CrearCasoUse", {
      state: {
        ticketData: ticket,
        mode: "edit", // Podemos usar este flag para diferenciar entre crear y editar
      },
    });
  };

  // Obtener rol del usuario desde localStorage
  const userRole = localStorage.getItem("rol") || "usuario";
  const nombre = localStorage.getItem("nombre");

  // Función para manejar resultados de búsqueda
  const onSearchResults = (results) => {
    setSearchResults(results);
  };

  // Debounce: espera 500ms después del último cambio antes de buscar
  useEffect(() => {
    if (searchTerm.trim().length === 0) return;

    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 500); // Tiempo de espera (ajústalo según necesidad)

    return () => clearTimeout(debounceTimer); // Limpia el timer si el término cambia antes
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/api/search", {
        params: { query: searchTerm },
      });
      onSearchResults(response.data);
    } catch (err) {
      setError("Error al buscar");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Datos de ejemplo para las tablas
  /*const tableData = {
    nuevo: [
      { id: "2503150021", solicitante: "Julian Antonio Niño Oedoy", elementos: "General", descripcion: "ALTA MÉDICA (1 - 0)" }
    ],
    enCurso: [
      { id: "2503160088", solicitante: "HUN HUN Generico", elementos: "General", descripcion: "LLAMADO DE TIMBRES (1 - 0)" },
      { id: "2503160088", solicitante: "Wendy Johanna Alfonso Peralta", elementos: "General", descripcion: "CONFIGURAR IMPRESORA (1 - 0)" }
    ],
    enEspera: [
      { id: "2503160088", solicitante: "HUN HUN Generico", elementos: "General", descripcion: "LLAMADO DE TIMBRES (1 - 0)" },
      { id: "2503160088", solicitante: "Wendy Johanna Alfonso Peralta", elementos: "General", descripcion: "CONFIGURAR IMPRESORA (1 - 0)" }
    ],
    resueltos: [
      { id: "2503160088", solicitante: "HUN HUN Generico", elementos: "General", descripcion: "LLAMADO DE TIMBRES (1 - 0)" },
      { id: "2503160088", solicitante: "Wendy Johanna Alfonso Peralta", elementos: "General", descripcion: "CONFIGURAR IMPRESORA (1 - 0)" }
    ],
    cerrados: [
      { id: "2503160088", solicitante: "HUN HUN Generico", elementos: "General", descripcion: "LLAMADO DE TIMBRES (1 - 0)" },
      { id: "2503160088", solicitante: "Wendy Johanna Alfonso Peralta", elementos: "General", descripcion: "CONFIGURAR IMPRESORA (1 - 0)" }
    ],
    borrados: [
      { id: "2503160088", solicitante: "HUN HUN Generico", elementos: "General", descripcion: "LLAMADO DE TIMBRES (1 - 0)" },
      { id: "2503160088", solicitante: "Wendy Johanna Alfonso Peralta", elementos: "General", descripcion: "CONFIGURAR IMPRESORA (1 - 0)" }
    ],
    encuesta: [
      { id: "2503160088", solicitante: "HUN HUN Generico", elementos: "General", descripcion: "LLAMADO DE TIMBRES (1 - 0)", surveyId: "survey1" },
      { id: "2503160088", solicitante: "Wendy Johanna Alfonso Peralta", elementos: "General", descripcion: "CONFIGURAR IMPRESORA (1 - 0)", surveyId: "survey2" }
    ]
  };*/

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/usuarios/estado_tickets");
        const allTickets = response.data;

        // Clasifica los tickets por estado
        const agrupados = {
          nuevo: [],
          enCurso: [],
          enEspera: [],
          resueltos: [],
          cerrados: [],
          borrados: [],
          encuesta: [], // Puedes llenar esto si tu backend te dice cuáles van a encuesta
        };

        allTickets.forEach((ticket) => {
          const estado = ticket.estado_ticket?.toLowerCase();
          if (estado && agrupados[estado] !== undefined) {
            agrupados[estado].push({
              id: ticket.id_ticket,
              solicitante: ticket.solicitante,
              elementos: ticket.tipo,
              descripcion: ticket.descripcion,
            });
          }
        });

        setTableData(agrupados);
      } catch (error) {
        console.error("Error al obtener los tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  // Filtrar encuestas no completadas
  const pendingSurveys = tableData.encuesta.filter(
    (survey) => !completedSurveys.includes(survey.surveyId)
  );

  // Función para marcar encuesta como completada
  const markSurveyAsCompleted = (surveyId) => {
    setCompletedSurveys([...completedSurveys, surveyId]);
  };

  // Renderizado modificado de la tabla de encuestas
  const renderSurveyTable = (data, title) => {
    return (
      <div className={styles.tablaContainer}>
        <h2>{title.toUpperCase()}</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>SOLICITANTE</th>
              <th>ELEMENTOS ASOCIADOS</th>
              <th>DESCRIPCIÓN</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>ID: {item.id}</td>
                <td>{item.solicitante}</td>
                <td>{item.elementos}</td>
                <td>{item.descripcion}</td>
                <td>
                  <Link
                    to={`/EncuestaSatisfaccion/${item.surveyId}`}
                    onClick={() => markSurveyAsCompleted(item.surveyId)}
                    className={styles.surveyLink}
                  >
                    Realizar Encuesta
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const tickets = [
    {
      label: "Nuevo",
      color: "green",
      icon: "🟢",
      count: tableData.nuevo.length,
      key: "nuevo",
    },
    {
      label: "En curso",
      color: "lightgreen",
      icon: "⭕",
      count: tableData.enCurso.length,
      key: "enCurso",
    },
    {
      label: "En espera",
      color: "orange",
      icon: "🟡",
      count: tableData.enEspera.length,
      key: "enEspera",
    },
    {
      label: "Resueltas",
      color: "gray",
      icon: "⚪",
      count: tableData.resueltos.length,
      key: "resueltos",
    },
    {
      label: "Cerrado",
      color: "black",
      icon: "⚫",
      count: tableData.cerrados.length,
      key: "cerrados",
    },
    {
      label: "Borrado",
      color: "red",
      icon: "🗑",
      count: tableData.borrados.length,
      key: "borrados",
    },
    {
      label: "Encuesta de Satisfacción",
      color: "purple",
      icon: "📅",
      count: pendingSurveys.length,
      key: "encuesta",
    },
  ];

  const handleTabClick = (tabKey) => {
    setActiveTab(activeTab === tabKey ? null : tabKey);
  };

  // Renderizado modificado de las tablas
  const renderTable = (data, title) => {
    return (
      <div className={styles.tablaContainer}>
        <h2>{title.toUpperCase()}</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>SOLICITANTE</th>
              <th>ELEMENTOS ASOCIADOS</th>
              <th>DESCRIPCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={styles.clickableRow}
                onClick={() => handleTicketClick(item)}
              >
                <td>ID: {item.id}</td>
                <td>{item.solicitante}</td>
                <td>{item.elementos}</td>
                <td>{item.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getRouteByRole = (section) => {
  const userRole = localStorage.getItem("rol");
  
  if (section === 'inicio') {
     if (userRole === 'administrador') {
      return '/HomeAdmiPage';
    } else if (userRole === 'tecnico') {
      return '/HomeTecnicoPage';
    } else {
      return '/home';
    }
  } else if (section === 'crear-caso') {
    if (userRole === 'administrador') {
      return '/CrearCasoAdmin';
    } else if (userRole === 'tecnico') {
      return '/CrearCasoAdmin';
    } else {
      return '/CrearCasoUse';
    }
  } if (section === "tickets") return "/Tickets";
      return "/";
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
          onMouseEnter={toggleMenu}
          onMouseLeave={toggleMenu}
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
      <div
        style={{
          marginLeft: isMenuExpanded ? "200px" : "60px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </div>
      {/* Header */}
      <header
        className={styles.containerInicio}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.containerInicioImg}>
          <Link
            to={getRouteByRole("inicio")}
            className={styles.linkSinSubrayado}
          >
            <FcHome className={styles.menuIcon} />
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
            <span className={styles.username}>
              Bienvenido, <span id="nombreusuario">{nombre}</span>
            </span>
            <div className={styles.iconContainer}>
              <Link to="/">
                <FaPowerOff className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div
        className={styles.container}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.sectionContainer}>
          <div className={styles.ticketContainer}>
            <li className={styles.creacion}>
              <Link to="/CrearCasoUse" className={styles.linkSinSubrayado}>
                <FcCustomerSupport className={styles.menuIcon} />
                <span className={styles.creacionDeTicket}>Crear Caso</span>
              </Link>
            </li>
          </div>

          <h2>Tickets</h2>
          <div className={styles.cardsContainer}>
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className={`${styles.card} ${
                  activeTab === ticket.key ? styles.activeCard : ""
                }`}
                style={{ borderColor: ticket.color }}
                onClick={() => handleTabClick(ticket.key)}
              >
                <span className={styles.icon}>{ticket.icon}</span>
                <span className={styles.label}>{ticket.label}</span>
                <span className={styles.count}>{ticket.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mostrar la tabla correspondiente al tab activo */}
        {activeTab === "nuevo" && renderTable(tableData.nuevo, "Nuevo")}
        {activeTab === "enCurso" && renderTable(tableData.enCurso, "En Curso")}
        {activeTab === "enEspera" &&
          renderTable(tableData.enEspera, "En Espera")}
        {activeTab === "resueltos" &&
          renderTable(tableData.resueltos, "Resueltos")}
        {activeTab === "cerrados" &&
          renderTable(tableData.cerrados, "Cerrados")}
        {activeTab === "borrados" &&
          renderTable(tableData.borrados, "Borrados")}
        {activeTab === "encuesta" &&
          renderSurveyTable(
            pendingSurveys,
            "Encuesta de Satisfacción pendientes"
          )}
      </div>

      {/*chatbot*/}

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

export default HomePage;
