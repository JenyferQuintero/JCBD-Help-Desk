import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from "../styles/Superadmin.module.css";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";

const SuperadminLayout = () => {
  const { user, logout } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handlers

  const nombre = localStorage.getItem("nombre");

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
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

  const handleSubmit = async (e, section = 'inicio') => {
  e?.preventDefault(); // Opcional porque ahora puede usarse para navegación
  setLoading(true);
  setMessage("");

  try {
    // Si no hay credenciales, verifica el rol almacenado (para navegación)
    if (!usuario && !password) {
      const storedRol = localStorage.getItem("rol");
      const storedId = localStorage.getItem("id_usuario");

      if (!storedRol || !storedId) {
        throw new Error("No hay sesión activa");
      }

      // Redirige según el rol almacenado y la sección
      if (section === 'inicio') {
        if (storedRol === 'administrador') {
          navigate("/Superadmin");
        } else if (storedRol === 'tecnico') {
          navigate("/HomeAdmiPage");
        } else {
          navigate("/home");
        }
      } 
      else if (section === 'crear-caso') {
        if (storedRol === 'administrador' || storedRol === 'tecnico') {
          navigate("/CrearCasoAdmin");
        } else {
          navigate("/CrearCasoUse");
        }
      } 
      else if (section === 'tickets') {
        if (storedRol === 'administrador') {
          navigate("/TicketsAdmin");
        } else if (storedRol === 'tecnico') {
          navigate("/TicketsTecnico");
        } else {
          navigate("/Tickets");
        }
      } 
      else {
        navigate("/home"); // Ruta por defecto
      }
      return;
    }

    
    const response = await axios.post("http://127.0.0.1:5000/auth/login", {
      usuario,
      password,
    });

    if (response.status === 200) {
      const { nombre, usuario, rol, usuario_id } = response.data;
      localStorage.setItem("id_usuario", usuario_id);
      localStorage.setItem("nombre", nombre);
      localStorage.setItem("usuario", usuario);
      localStorage.setItem("rol", rol);

      // Redirige según el rol después del login
      if (rol === "usuario") {
        navigate("/home");
      } else if (rol === "administrador") {
        navigate("/Superadmin");
      } else if (rol === "tecnico") {
        navigate("/HomeAdmiPage");
      } else {
        alert("Sin rol para ingresar");
        window.location.reload();
      }
    }
    setMessage(response.data.mensaje);
  } catch (error) {
    setMessage(error.response?.data?.error || "Error de autenticación o navegación");
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    } catch (err) {
      setError("Error al realizar la búsqueda");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <Link to={handleNavigation('inicio')} className={styles.linkSinSubrayado}>
                  <FcHome className={styles.menuIcon} />
                  <span className={styles.menuText}>Inicio</span>
                </Link>
              </li>

              {/* Opción Crear Caso - visible para todos */}
              <li className={styles.iconosMenu}>
                <Link to={handleNavigation('crear-caso')} className={styles.linkSinSubrayado}>
                  <FcCustomerSupport className={styles.menuIcon} />
                  <span className={styles.menuText}>Crear Caso</span>
                </Link>
              </li>

              {/* Opción Tickets - visible para todos */}
              <li className={styles.iconosMenu}>
                <Link to={handleNavigation('tickets')} className={styles.linkSinSubrayado}>
                  <FcAnswers className={styles.menuIcon} />
                  <span className={styles.menuText}>Tickets</span>
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
          <Link to={handleNavigation('inicio')} className={styles.linkSinSubrayado}>
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
<<<<<<< HEAD
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{nombre}</span></span>
=======
            <span className={styles.username}>Bienvenido, {nombre}</span>
>>>>>>> 6f35d6fd23931639e33de38c72da2f182dd2e407
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

export default SuperadminLayout;