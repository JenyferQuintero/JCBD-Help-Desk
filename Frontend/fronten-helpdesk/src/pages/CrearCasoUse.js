import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useNavigate, Outlet, useLocation, useParams } from "react-router-dom";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcCustomerSupport, FcAnswers } from "react-icons/fc";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/CrearCasoUse.module.css";

const CrearCasoUse = () => {
  // Estados
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const navigate = useNavigate();

  // Obtener rol del usuario desde localStorage
  const userRole = localStorage.getItem("rol") || "usuario";
  const nombre = localStorage.getItem("nombre");

  // Handlers
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

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/Tickets?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };


  console.log(nombre);
  

  // Estado del formulario
  const [formData, setFormData] = useState({
    id: "",
    tipo: "",
    origen: "",
    prioridad: "",
    categoria: "",
    titulo: "",
    descripcion: "",
    archivo: null,
    solicitante: nombre || "",
    elementos: "",
  });

  // Obtener datos iniciales al cargar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Obtener usuarios
        const usuariosResponse = await axios.get(
          "http://localhost:5000/usuarios/obtener"
        );
        setUsuarios(usuariosResponse.data);

        // Obtener departamentos
        const deptosResponse = await axios.get(
          "http://localhost:5000/usuarios/obtenerEntidades"
        );
        setDepartamentos(deptosResponse.data);

        // Obtener categorías
        const catsResponse = await axios.get(
          "http://localhost:5000/usuarios/obtenerCategorias"
        );
        setCategorias(catsResponse.data);
        

        // Cargar datos del ticket si estamos en modo edición
        if (location.state?.ticketData) {
          setFormData((prev) => ({
            ...prev,
            ...location.state.ticketData,
          }));
        }
      } catch (error) {
        console.error("Error al obtener datos iniciales:", error);
        setError("Error al cargar datos iniciales");
      }
    };

    fetchInitialData();
  }, [location.state]);

  


  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("prioridad", formData.prioridad);
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("origen", formData.origen);
      if (formData.archivo) {
        formDataToSend.append("archivo", formData.archivo);
      }

      if (location.state?.mode === "edit") {
        await axios.put(
          `http://localhost:5000/usuarios/tickets${formData.id}`,
          formDataToSend,
          {}
        );
        setSuccess("Ticket actualizado correctamente");
      } else {
        await axios.post(
          "http://localhost:5000/usuarios/tickets",
          formDataToSend,
          {}
        );
        setSuccess("Ticket creado correctamente");
      }

      setTimeout(() => navigate("/Tickets"), 2000);
    } catch (error) {
      console.error("Error al procesar el ticket:", error);
      setError(
        error.response?.data?.detail || "Error al procesar la solicitud"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Validación del formulario
  const validateForm = () => {
    return (
      formData.tipo &&
      formData.origen &&
      formData.prioridad &&
      formData.categoria &&
      formData.titulo &&
      formData.descripcion &&
      formData.solicitante
    );
  };

 const getRouteByRole = (section) => {
  const userRole = localStorage.getItem("rol");
  
  if (section === 'inicio') {
    if (userRole === 'administrador') {
      return '/Superadmin';
    } else if (userRole === 'tecnico') {
      return '/HomeAdmiPage';
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
  } else if (section === 'tickets') {
    if (userRole === 'administrador') {
      return '/TicketsAdmin';
    } else if (userRole === 'tecnico') {
      return '/TicketsTecnico';
    } else {
      return '/Tickets';
    }
  } else {
    return '/home';
  }
};
  return (

    <div className={styles.containerPrincipal}>
      {/* Menú Vertical */}
      <aside
        className={`${styles.menuVertical} ${
          isMenuExpanded ? styles.expanded : ""
        }`}
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
                <Link to={getRouteByRole('inicio')} className={styles.linkSinSubrayado}>
                  <FcHome className={styles.menuIcon} />
                  <span className={styles.menuText}>Inicio</span>
                </Link>
              </li>

              {/* Opción Crear Caso - visible para todos */}
              <li className={styles.iconosMenu}>
                <Link to={getRouteByRole('crear-caso')} className={styles.linkSinSubrayado}>
                  <FcCustomerSupport className={styles.menuIcon} />
                  <span className={styles.menuText}>Crear Caso</span>
                </Link>
              </li>

              {/* Opción Tickets - visible para todos */}
              <li className={styles.iconosMenu}>
                <Link to={getRouteByRole('tickets')} className={styles.linkSinSubrayado}>
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
      <header
        className={styles.containerInicio}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.containerInicioImg}>
          <Link to={getRouteByRole('inicio')} className={styles.linkSinSubrayado}>
            <FcHome className={styles.menuIcon} />
            <span>Inicio</span>
          </Link>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.searchContainer}>
            <input className={styles.search} type="text" placeholder="Buscar" />
            <button type="submit" className={styles.buttonBuscar} title="Buscar">
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
      <div className={styles.containercaso} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        
        <div className={styles.sectionContainer}>
          <div className={styles.ticketContainer}>
            <ul className={styles.creacion}>
              <li>
                <Link to="/CrearCasoUse" className={styles.linkSinSubrayado}>
                  <FcCustomerSupport className={styles.menuIcon} />
                  <span className={styles.creacionDeTicket}>
                    {location.state?.mode === "edit"
                      ? "Editar Ticket"
                      : "Crear Nuevo Ticket"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button
              onClick={() => setError(null)}
              className={styles.closeMessage}
            >
              &times;
            </button>
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            {success}
            <button
              onClick={() => setSuccess(null)}
              className={styles.closeMessage}
            >
              &times;
            </button>
          </div>
        )}

       
        
          {/* Formulario */}
          <div className={styles.formColumn}>
            <div className={styles.formContainerCaso}>
              <form onSubmit={handleSubmit}>
                {location.state?.mode === 'edit' && (
                  <div className={styles.formGroupCaso}>
                    <label className={styles.casoLabel}>ID</label>
                    <input
                      className={styles.casoInput}
                      type="text"
                      name="id"
                      value={formData.id}
                      readOnly
                    />
                  </div>
                )}

              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Tipo*</label>
                <select
                  className={styles.casoSelect}
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="incidencia">Incidencia</option>
                  <option value="requerimiento">Requerimiento</option>
                </select>
              </div>

                {/* Campo Origen con datos dinámicos */}
                <div className={styles.formGroupCaso}>
                  <label className={styles.casoLabel}>Origen*</label>
                  <select
                    className={styles.casoSelect}
                    name="origen"
                    value={formData.origen}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {departamentos.map(depto => (
                      <option key={depto.id} value={depto.nombre}>
                        {depto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Prioridad*</label>
                <select
                  className={styles.casoSelect}
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="alta">Alta</option>
                  <option value="mediana">Mediana</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

                {/* Campo Categoría con datos dinámicos */}
                <div className={styles.formGroupCaso}>
                  <label className={styles.casoLabel}>Categoría*</label>
                  <select
                    className={styles.casoSelect}
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Título*</label>
                <input
                  className={styles.casoInput}
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>

                <div className={styles.formGroupCaso}>
                  <label className={styles.casoLabel}>Solicitante*</label>
                  <select
                    className={styles.casoSelect}
                    name="solicitante"
                    value={formData.solicitante}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un usuario...</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={`${usuario.nombres} ${usuario.apellidos}`}>
                        {`${usuario.nombres} ${usuario.apellidos}`} ({usuario.email})
                      </option>
                    ))}
                  </select>
                </div>

              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Elementos Asociados</label>
                <input
                  className={styles.casoInput}
                  type="text"
                  name="elementos"
                  value={formData.elementos}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Descripción*</label>
                <textarea
                  className={styles.casoTextarea}
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>

                <div className={styles.formGroupCaso}>
                  <label className={styles.casoLabel}>Adjuntar archivo</label>
                  <input
                    className={styles.casoFile}
                    type="file"
                    name="archivo"
                    onChange={handleChange}
                  />
                  {formData.archivo && (
                    <span className={styles.fileName}>{formData.archivo.name}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading || !validateForm()}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner}></span>
                  ) : (
                    location.state?.mode === 'edit' ? 'Actualizar Ticket' : 'Crear Ticket'
                  )}
                </button>
              </form>
            </div>
          </div>

          
       
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

      export default CrearCasoUse;