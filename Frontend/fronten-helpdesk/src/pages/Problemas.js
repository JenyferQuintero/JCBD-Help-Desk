import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import styles from "../styles/Problemas.module.css";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";

const Problemas = () => {
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
      
        // Obtener datos del usuario
        const nombre = localStorage.getItem("nombre");
        const userRole = localStorage.getItem("rol") || "";
      
      
        // Datos
        const tickets = [
          { label: "Nuevo", color: "green", icon: "🟢", count: 0 },
          { label: "En curso (asignada)", color: "lightgreen", icon: "📅", count: 0 },
          { label: "En espera", color: "orange", icon: "🟡", count: 0 },
          { label: "Resueltas", color: "gray", icon: "⚪", count: 0 },
          { label: "Cerrado", color: "black", icon: "⚫", count: 0 },
          { label: "Borrado", color: "red", icon: "🗑", count: 0 },
          { icon: "📝", label: "Abiertos", count: 5, color: "#4CAF50" },
          { icon: "⏳", label: "En curso", count: 3, color: "#FFC107" },
          { icon: "✅", label: "Cerrados", count: 12, color: "#2196F3" },
          { icon: "⚠️", label: "Pendientes", count: 2, color: "#FF5722" },
          { icon: "🔧", label: "En solución", count: 1, color: "#9C27B0" },
          { icon: "✔️", label: "Resueltos", count: 4, color: "#607D8B" },
        ];
      
        const problems = [
          { label: "Nuevo", color: "green", icon: "🟢", count: 0 },
          { label: "Aceptado", color: "#008000", icon: "✔", count: 0 },
          { label: "En curso (asignada)", color: "lightgreen", icon: "📅", count: 0 },
          { label: "En espera", color: "orange", icon: "🟡", count: 0 },
          { label: "Resueltas", color: "gray", icon: "⚪", count: 0 },
          { label: "Bajo observación", color: "black", icon: "👁", count: 0 },
          { label: "Cerrado", color: "black", icon: "⚫", count: 0 },
          { label: "Borrado", color: "red", icon: "🗑", count: 0 },
      
        ];
      
      
      
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
      
        const handleSelectChange = (event) => {
          const value = event.target.value;
          setActiveView(value === "0" ? "personal" : value === "1" ? "global" : "todo");
        };
      
        const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
        const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
      
        const roleToPath = {
          usuario: '/home',
          tecnico: '/HomeAdmiPage',
          administrador: '/Superadmin'
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
                  <ul className={styles.menuIconos}>
                    {/* Opción Inicio - visible para todos */}
                    <li className={styles.iconosMenu}>
                      <Link to={roleToPath[userRole] || '/home'} className={styles.linkSinSubrayado}>
                        <FcHome className={styles.menuIcon} />
                        <span className={styles.menuText}>Inicio</span>
                      </Link>
                    </li>
      
                    {/* Menú Soporte - solo para técnicos */}
                    {userRole === "tecnico" && (
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
                            <Link to="/Problemas" className={styles.submenuLink}>
                              <FcExpired className={styles.menuIcon} />
                              <span className={styles.menuText}>Problemas</span>
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
                    )}
      
                    {/* Menú Administración - solo para técnicos */}
                    {userRole === "tecnico" && (
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
                    )}
      
                    {/* Menú Configuración - solo para técnicos */}
                    {userRole === "tecnico" && (
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
                    )}
                  </ul>
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
            <div className={styles.container} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
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
                        <select className={`${styles.viewSelect} form-select`} onChange={handleSelectChange}>
                          <option value={0}>Vista Personal</option>
                          <option value={1}>Vista Global</option>
                          <option value={2}>Todo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
      
                <div className="app-container">
                  {/* Vista Personal */}
                  {(activeView === "personal" || activeView === "todo") && (
                    <>
                      <div className={styles.tablaContainer}>
                        <h2>SUS CASOS A CERRAR</h2>
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
                            <tr>
                              <td>ID: 2503160091</td>
                              <td>Santiago Caricena Corredor</td>
                              <td>General</td>
                              <td>NO LE PERMITE REALIZA NINGUNA ACCIÓN - USUARIO TEMPORAL (1 - 0)</td>
                            </tr>
                            <tr>
                              <td>ID: 2503160090</td>
                              <td>Santiago Caricena Corredor</td>
                              <td>General</td>
                              <td>CONFIGURAR IMPRESORA (1 - 0)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
      
                      <div className={styles.tablaContainer}>
                        <h2>SUS CASOS EN CURSO</h2>
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
                            <tr>
                              <td>ID: 2503160088</td>
                              <td>HUN HUN Generico</td>
                              <td>General</td>
                              <td>LLAMOO DE TIMBRES (1 - 0)</td>
                            </tr>
                            <tr>
                              <td>ID: 2503160088</td>
                              <td>Wendy Johanna Alfonso Peralta</td>
                              <td>General</td>
                              <td>CONFIGURAR IMPRESORA (1 - 0)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
      
                      <div className={styles.tablaContainer}>
                        <h2>ENCUESTA DE SATISFACCIÓN</h2>
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
                            <tr>
                              <td>ID: 2503150021</td>
                              <td>Julian Antonio Niño Oedoy</td>
                              <td>General</td>
                              <td>ALTA MEDICA (1 - 0)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
      
                  {/* Vista Global */}
                  {(activeView === "global" || activeView === "todo") && (
                    <>
                      <div className={styles.sectionContainer}>
                        <h2>Tickets</h2>
                        <div className={styles.cardsContainer}>
                          {tickets.map((ticket, index) => (
                            <div key={index} className={styles.card} style={{ borderColor: ticket.color }}>
                              <span className="icon">{ticket.icon}</span>
                              <span className="label">{ticket.label}</span>
                              <span className="count">{ticket.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
      
                      <div className={styles.sectionContainer}>
                        <h2>Problemas</h2>
                        <div className={styles.cardsContainer}>
                          {problems.map((problem, index) => (
                            <div key={index} className={styles.card} style={{ borderColor: problem.color }}>
                              <span className="icon">{problem.icon}</span>
                              <span className="label">{problem.label}</span>
                              <span className="count">{problem.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
      
export default Problemas;