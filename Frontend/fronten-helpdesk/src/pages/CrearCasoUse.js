import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useNavigate, Outlet, useLocation, useParams } from "react-router-dom";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import ChatBot from "../Componentes/ChatBot";
import { NotificationContext } from "../context/NotificationContext";
import styles from "../styles/CrearCasoUse.module.css";
import MenuVertical from "../Componentes/MenuVertical";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Obtener datos del usuario desde localStorage
  const userRole = localStorage.getItem("rol") || "usuario";
  const userNombre = localStorage.getItem("nombre") || "";
  const userId = localStorage.getItem("id_usuario");

  // Determinar si estamos en modo edición
  const isEditMode = id || location.state?.ticketData;

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

  const roleToPath = {
    usuario: '/home',
    tecnico: '/HomeTecnicoPage',
    administrador: '/HomeAdmiPage'
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    id: "",
    tipo: "incidente",
    origen: "",
    ubicacion: "",
    prioridad: "",
    categoria: "",
    titulo: "",
    descripcion: "",
    archivo: null,
    solicitante: userId,
    estado: "nuevo"
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

        // Obtener datos del usuario logueado para el campo origen
        const userResponse = await axios.get(
          `http://localhost:5000/usuarios/obtenerUsuario/${userId}`
        );
        const userData = userResponse.data;
        
        // Cargar datos del ticket si estamos en modo edición
        if (isEditMode) {
          const ticketId = id || location.state?.ticketData?.id_ticket || location.state?.ticketData?.id;
          const response = await axios.get(
            `http://localhost:5000/usuarios/tickets/${ticketId}`
          );
          const ticketData = response.data;

          setFormData({
            id: ticketData.id,
            tipo: ticketData.tipo,
            origen: ticketData.origen || userData.entidad,
            ubicacion: ticketData.ubicacion,
            prioridad: ticketData.prioridad,
            categoria: ticketData.id_categoria1,
            titulo: ticketData.titulo,
            descripcion: ticketData.descripcion,
            archivo: null,
            solicitante: userId,
            estado: ticketData.estado_ticket
          });
        } else {
          // En modo creación, establecer el origen con la entidad del usuario
          setFormData(prev => ({
            ...prev,
            origen: userData.entidad
          }));
        }
      } catch (error) {
        console.error("Error al obtener datos iniciales:", error);
        setError("Error al cargar datos iniciales");
      }
    };

    fetchInitialData();
  }, [id, location.state, isEditMode, userId]);

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
      
      // Campos que siempre se envían
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("solicitante", formData.solicitante);
      formDataToSend.append("ubicacion", formData.ubicacion);
      
      // Campos adicionales para admin/tecnico o creación
      if (!isEditMode || userRole === 'administrador' || userRole === 'tecnico') {
        formDataToSend.append("prioridad", formData.prioridad);
        formDataToSend.append("tipo", formData.tipo);
        formDataToSend.append("categoria", formData.categoria);
      }

      if (formData.archivo) {
        formDataToSend.append("archivo", formData.archivo);
      }

      if (isEditMode) {
        // En modo edición, agregar datos de usuario para validación en backend
        formDataToSend.append("user_id", userId);
        formDataToSend.append("user_role", userRole);
        
        const response = await axios.put(
          `http://localhost:5000/usuarios/tickets/${formData.id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        
        if (response.data.success) {
          setSuccess("Ticket actualizado correctamente");
        } else {
          setError(response.data.message || "Error al actualizar el ticket");
          return;
        }
      } else {
        const response = await axios.post(
          "http://localhost:5000/usuarios/tickets",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          setSuccess("Ticket creado correctamente");
        } else {
          setError(response.data.message || "Error al crear el ticket");
          return;
        }
      }

      setTimeout(() => navigate("/Tickets"), 2000);
    } catch (error) {
      console.error("Error detallado:", {
        error: error,
        response: error.response,
        request: error.request,
      });
      
      let errorMsg = "Error al procesar la solicitud";
      if (error.response) {
        errorMsg = error.response.data?.message || 
          `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMsg = "No se recibió respuesta del servidor";
      } else {
        errorMsg = error.message || "Error al procesar la solicitud";
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Validación del formulario
  const validateForm = () => {
    if (isEditMode) {
      // En modo edición, solo requerimos título, descripción y ubicación para usuarios normales
      if (userRole === 'usuario') {
        return formData.titulo && formData.descripcion && formData.ubicacion;
      }
    }
    
    // Para creación o edición por admin/tecnico, validar todos los campos
    return (
      formData.tipo &&
      formData.prioridad &&
      formData.categoria &&
      formData.titulo &&
      formData.descripcion &&
      formData.solicitante &&
      formData.ubicacion
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
    } else if (section === "tickets") {
      return "/Tickets";
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
            <input 
              className={styles.search} 
              type="text" 
              placeholder="Buscar" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit" 
              className={styles.buttonBuscar} 
              title="Buscar"
              onClick={handleSearch}
            >
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
            {isLoading && <span className={styles.loading}>Buscando...</span>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.userContainer}>
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{userNombre}</span></span>
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
                    {isEditMode ? "Editar Ticket" : "Crear Nuevo Ticket"}
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
              {/* Campo ID oculto (necesario para el backend pero no visible) */}
              {isEditMode && <input type="hidden" name="id" value={formData.id} />}

              {/* Solicitante */}
              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Solicitante*</label>
                <input
                  className={styles.casoInput}
                  type="text"
                  value={userNombre}
                  readOnly
                  disabled
                />
              </div>

              {/* Estado (solo visible en edición) */}
              {isEditMode && (
                <div className={styles.formGroupCaso}>
                  <label className={styles.casoLabel}>Estado</label>
                  <input
                    className={styles.casoInput}
                    type="text"
                    value={formData.estado}
                    readOnly
                    disabled
                  />
                </div>
              )}

              {/* Campo Origen - solo lectura */}
              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Origen*</label>
                <input
                  className={styles.casoInput}
                  type="text"
                  name="origen"
                  value={formData.origen || ''}
                  readOnly
                />
              </div>
                
              {/* Campo Ubicación - editable siempre */}
              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Ubicación*</label>
                <input
                  className={styles.casoInput}
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Edificio A, Piso 3, Oficina 302"
                />
              </div>

              {/* Prioridad - editable solo en creación o por admin/tecnico */}
              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Prioridad*</label>
                <select
                  className={styles.casoSelect}
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  required={!isEditMode}
                  disabled={isEditMode && !(userRole === 'administrador' || userRole === 'tecnico')}
                >
                  <option value="">Seleccione...</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
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
                  required={!isEditMode}
                  disabled={isEditMode && !(userRole === 'administrador' || userRole === 'tecnico')}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título - siempre editable */}
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

              {/* Descripción - siempre editable */}
              <div className={styles.formGroupCaso}>
                <label className={styles.casoLabel}>Descripción*</label>
                <textarea
                  className={styles.casoTextarea}
                  placeholder="Describa el caso detalladamente" 
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>

              {/* Archivo adjunto - siempre editable */}
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
                  isEditMode ? 'Actualizar Ticket' : 'Crear Ticket'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
   <ChatBot />
    </div>
  );
};

export default CrearCasoUse;
