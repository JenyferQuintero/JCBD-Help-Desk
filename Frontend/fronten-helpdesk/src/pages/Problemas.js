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

  // Handlers

<<<<<<< HEAD
  const nombre = localStorage.getItem("nombre");

=======
>>>>>>> 6f35d6fd23931639e33de38c72da2f182dd2e407
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
<<<<<<< HEAD

          <div className={styles.empresarialContainer}>
            <img src={Logoempresarial} alt="Logoempresarial" />
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
          <Link to="/HomeAdmiPage" className={styles.linkSinSubrayado}>
            <FcHome className={styles.menuIcon} />
            <span>Inicio</span>
          </Link>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar"
              className={styles.search}
            />
            <button
              type="submit"
              className={styles.buttonBuscar}
              title="Buscar"
            >
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
          </div>
          <div className={styles.userContainer}>
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{nombre}</span></span>
            <div className={styles.iconContainer}>
              <Link to="/">
                <FaPowerOff className={styles.icon} />
=======
          {/* Header */}
          <header className={styles.containerInicio} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
            <div className={styles.containerInicioImg}>
              <Link to={roleToPath[userRole] || '/home'} className={styles.linkSinSubrayado}>
                <span>Inicio</span>
>>>>>>> 6f35d6fd23931639e33de38c72da2f182dd2e407
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
                <span className={styles.username}>Bienvenido, {nombre}</span>
                <div className={styles.iconContainer}>
                  <Link to="/">
                    <FaPowerOff className={styles.icon} />
                  </Link>
                </div>
              </div>
            </div>
          </header>


      <div className={styles.container} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>

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