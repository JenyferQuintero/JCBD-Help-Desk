import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaPlus, FaSpinner } from "react-icons/fa";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import styles from "../styles/Usuarios.module.css";
import axios from "axios";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";


const Usuarios = () => {
  // Estados para el menú y UI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [error, setError] = useState(null);

  // Estados para gestión de usuarios
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("usuario");
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Obtener datos del usuario
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol") || "";

  // Estado para el formulario
  const [formData, setFormData] = useState({
    usuario: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    contrasena: '',
    activo: 'si',
    entidad: '',
    rol: ''
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Validación del formulario en tiempo real
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case 'usuario':
        if (!value.trim()) errors.usuario = 'Usuario es requerido';
        else if (value.length < 3) errors.usuario = 'Mínimo 3 caracteres';
        else delete errors.usuario;
        break;
      case 'nombres':
        if (!value.trim()) errors.nombres = 'Nombres son requeridos';
        else delete errors.nombres;
        break;
      case 'apellidos':
        if (!value.trim()) errors.apellidos = 'Apellidos son requeridos';
        else delete errors.apellidos;
        break;
      case 'correo':
        if (!value.trim()) errors.correo = 'Correo es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.correo = 'Correo inválido';
        else delete errors.correo;
        break;
      case 'telefono':
        if (value && !/^\d{7,15}$/.test(value)) errors.telefono = 'Teléfono inválido';
        else delete errors.telefono;
        break;
      case 'contrasena':
        if (!editingUser && !value.trim()) errors.contrasena = 'Contraseña es requerida';
        else if (value && value.length < 6) errors.contrasena = 'Mínimo 6 caracteres';
        else delete errors.contrasena;
        break;
      case 'entidad':
        if (!value.trim()) errors.entidad = 'Entidad es requerida';
        else delete errors.entidad;
        break;
      case 'rol':
        if (!value.trim()) errors.rol = 'Rol es requerido';
        else delete errors.rol;
        break;
      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario con validación
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };

  useEffect(() => {

    const applyFilters = () => {
      let result = [...users];

      // Filtro principal (superior)
      if (searchField && searchTerm) {
        result = result.filter((user) => {
          const value = user[searchField];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // Filtros adicionales
      additionalFilters.forEach((filter) => {
        if (filter.field && filter.value) {
          result = result.filter((user) => {
            const value = user[filter.field];
            return value && value.toString().toLowerCase().includes(filter.value.toLowerCase());
          });
        }
      });

      setFilteredUsers(result);
    };

    applyFilters();
  }, [searchField, searchTerm, additionalFilters, users]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []) // Solo al montar el componente
  // Función para obtener usuarios
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/usuarios/obtener");
      const data = response.data;
      setUsers(data); // directamente, porque es un array
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(users[0]);
  // Preparar formulario para edición
  const handleEdit = (user) => {
    setEditingUser(user.id_usuario);
    setFormData({
      usuario: user.usuario,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
      telefono: user.telefono,
      contrasena: '', // No mostramos la contraseña por seguridad
      activo: user.activo,
      entidad: user.entidad,
      rol: user.rol
    });
    setShowForm(true);
  };

  const handleDelete = async (id_usuario) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    try {
      const response = await axios.delete(`http://localhost:5000/usuarios/eliminar/${id_usuario}`);

      if (response.data.success) {
        alert("Usuario eliminado correctamente");
        fetchUsers(); // recarga los usuarios
      } else {
        alert("Error al eliminar el usuario");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Ocurrió un error al intentar eliminar el usuario.");
    }
  };
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación final antes de enviar
   let isValid = true;
  const fieldsToValidate = ['usuario', 'nombres', 'apellidos', 'correo', 'entidad', 'rol'];
  if (!editingUser) fieldsToValidate.push('contrasena');

  fieldsToValidate.forEach(field => {
    isValid = validateField(field, formData[field]) && isValid;
  });

  if (!isValid) {
    alert('Por favor complete todos los campos requeridos correctamente');
    return;
  }

  setIsLoading(true);
  try {
    const token = localStorage.getItem("token");
    const url = editingUser 
      ? `http://localhost:5000/usuarios/actualizacion/${editingUser}`
      : 'http://localhost:5000/usuarios/creacion';

      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingUser ? 'Usuario actualizado correctamente' : 'Usuario guardado correctamente');
        resetForm();
        fetchUsers();
      } else {
        alert('Error al guardar: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      usuario: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      contrasena: '',
      activo: 'si',
      entidad: '',
      rol: ''
    });
    setFormErrors({});
    setEditingUser(null);
    setShowForm(false);
  };

  // Manejar búsqueda de usuarios
  /*const handleSearch = (e) => {
    e.preventDefault();
  
    // Aplica los filtros al frontend sin llamar al backend
    const applyFilters = () => {
      let result = [...users];
  
      if (searchField && searchTerm) {
        result = result.filter((user) => {
          const value = user[searchField];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
  
      additionalFilters.forEach((filter) => {
        if (filter.field && filter.value) {
          result = result.filter((user) => {
            const value = user[filter.field];
            return value && value.toString().toLowerCase().includes(filter.value.toLowerCase());
          });
        }
      });
  
      setFilteredUsers(result);
      setCurrentPage(1); // Reinicia a la primera página
    };
  
    applyFilters();
  };*/


  // Manejar filtros adicionales
  const addFilterField = () => {
    setAdditionalFilters([...additionalFilters, { field: 'usuario', value: '' }]);
  };

  const handleFilterChange = (index, field, value) => {
    const updatedFilters = [...additionalFilters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setAdditionalFilters(updatedFilters);
  };

  const removeFilter = (index) => {
    const updatedFilters = [...additionalFilters];
    updatedFilters.splice(index, 1);
    setAdditionalFilters(updatedFilters);
  };

  // Resetear búsqueda y mostrar lista de usuarios
  const resetSearch = async () => {
    setSearchTerm("");
    setAdditionalFilters([]);
    setIsLoading(true);
    try {
      await fetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para el menú
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

  // Lógica de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

const roleToPath = {
    usuario: '/home',
    tecnico: '/HomeTecnicoPage',
    administrador: '/HomeAdmiPage'
  };


   const getRouteByRole = (section) => {
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

      <div className={styles.container} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        {/* Spinner de carga */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <FaSpinner className={styles.spinner} />
          </div>
        )}

        {/* Controles superiores */}
        <div className={styles.topControls}>
          <button onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }} className={styles.addButton}>
            <FaPlus /> {showForm ? 'Ver Usuarios' : 'Agregar Usuario'}
          </button>
        </div>

        {/* Contenido alternado */}
        {showForm ? (
          // FORMULARIO DE CREACIÓN/EDICIÓN DE USUARIO
          <div className={styles.containerUsuarios}>
            <h2 className={styles.titulo}>
              {editingUser ? 'Editar Usuario' : 'Formulario de Creación de Usuario'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.gridContainerUsuarios}>
                <div className={styles.columna}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Usuario</label>
                    <input
                      type="text"
                      className={`${styles.input} ${formErrors.usuario ? styles.inputError : ''}`}
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.usuario && <span className={styles.errorMessage}>{formErrors.usuario}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre(s)</label>
                    <input
                      type="text"
                      className={`${styles.input} ${formErrors.nombres ? styles.inputError : ''}`}
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.nombres && <span className={styles.errorMessage}>{formErrors.nombres}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Apellido(s)</label>
                    <input
                      type="text"
                      className={`${styles.input} ${formErrors.apellidos ? styles.inputError : ''}`}
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.apellidos && <span className={styles.errorMessage}>{formErrors.apellidos}</span>}
                  </div>
                </div>

                <div className={styles.columna}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Correo</label>
                    <input
                      type="email"
                      className={`${styles.input} ${formErrors.correo ? styles.inputError : ''}`}
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.correo && <span className={styles.errorMessage}>{formErrors.correo}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Teléfono</label>
                    <input
                      type="tel"
                      className={`${styles.input} ${formErrors.telefono ? styles.inputError : ''}`}
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                    {formErrors.telefono && <span className={styles.errorMessage}>{formErrors.telefono}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contraseña</label>
                    <input
                      type="password"
                      className={`${styles.input} ${formErrors.contrasena ? styles.inputError : ''}`}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder={editingUser ? "Dejar en blanco para no cambiar" : ""}
                      required={!editingUser}
                    />
                    {formErrors.contrasena && <span className={styles.errorMessage}>{formErrors.contrasena}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.selectsContainer}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Activo</label>
                  <select className={styles.select} name="activo" value={formData.activo} onChange={handleChange} required>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Entidades</label>
                  <select
                    className={`${styles.select} ${formErrors.entidad ? styles.inputError : ''}`}
                    name="entidad"
                    value={formData.entidad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="tic">TIC</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="financiera">Financiera</option>
                    <option value="compras">Compras</option>
                    <option value="almacen">Almacén</option>
                  </select>
                  {formErrors.entidad && <span className={styles.errorMessage}>{formErrors.entidad}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rol</label>
                  <select
                    className={`${styles.select} ${formErrors.rol ? styles.inputError : ''}`}
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="administrador">Administrador</option>
                    <option value="tecnico">Técnico</option>
                    <option value="usuario">Usuario</option>
                  </select>
                  {formErrors.rol && <span className={styles.errorMessage}>{formErrors.rol}</span>}
                </div>
              </div>

              <div className={styles.botonesContainer}>
                <div>
                  <button type="submit" className={styles.boton} disabled={isLoading}>
                    {isLoading ? <FaSpinner className={styles.spinnerButton} /> : 'Guardar'}
                  </button>
                </div>
                <div>
                  <button type="button" onClick={resetForm} className={styles.botonCancelar}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          // LISTA DE USUARIOS
          <>
            {/* Sistema de búsqueda */}
            <div className={styles.searchSection}>
              <h2 className={styles.sectionTitle}>Buscar Usuarios</h2>
              <form className={styles.searchForm}>
                <div className={styles.mainSearch}>
                  <div className={styles.searchFieldGroup}>
                    <select className={styles.searchSelect} value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                      <option value="nombre_usuario">Usuario</option>
                      <option value="nombres">Nombre</option>
                      <option value="apellidos">Apellidos</option>
                      <option value="correo">Correo</option>
                      <option value="rol">Rol</option>
                      <option value="entidad">Entidad</option>
                    </select>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder={`Buscar por ${searchField}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <button type="submit" className={styles.searchButton} disabled={isLoading}>
                    {isLoading ? <FaSpinner className={styles.spinnerButton} /> : <><FaSearch /> Buscar</>}
                  </button>
                  <button type="button" onClick={resetSearch} className={styles.resetButton} disabled={isLoading}>
                    Usuarios
                  </button>
                  <button type="button" onClick={addFilterField} className={styles.addFilterButton}>
                    <FaFilter /> Agregar Filtro
                  </button>
                </div>

                {additionalFilters.map((filter, index) => (
                  <div key={index} className={styles.additionalFilter}>
                    <select
                      className={styles.searchSelect}
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="nombre_usuario">Usuario</option>
                      <option value="nombres">Nombre</option>
                      <option value="apellidos">Apellidos</option>
                      <option value="correo">Correo</option>
                      <option value="rol">Rol</option>
                      <option value="entidad">Entidad</option>
                      <option value="activo">Activo</option>
                    </select>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder={`Filtrar por ${filter.field}...`}
                      value={filter.value}
                      onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                    />
                    <button type="button" onClick={() => removeFilter(index)} className={styles.removeFilterButton}>×</button>
                  </div>
                ))}
              </form>
            </div>

            {/* Tabla de usuarios */}
            <div className={styles.usersTableContainer}>
              <h2 className={styles.sectionTitle}>Usuarios Registrados ({users.length})</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre(s)</th>
                      <th>Apellido(s)</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="8" className={styles.loadingCell}>
                          <FaSpinner className={styles.spinner} /> Cargando usuarios...
                        </td>
                      </tr>
                    ) : currentRows.length > 0 ? (
                      currentRows.map((user) => (
                        <tr key={user.id_usuario}>
                          <td>{user.nombre_usuario}</td>
                          <td>{user.nombres}</td>
                          <td>{user.apellidos}</td>
                          <td>{user.correo}</td>
                          <td>{user.telefono}</td>
                          <td>{user.rol}</td>
                          <td>{user.activo === 'si' ? 'Sí' : 'No'}</td>
                          <td>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleEdit(user)}
                            >
                              Editar
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() => handleDelete(user.id_usuario)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className={styles.noUsers}>No se encontraron usuarios</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            <div className={styles.paginationControls}>
              <div className={styles.rowsPerPageSelector}>
                <span>Filas por página:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className={styles.rowsSelect}
                  disabled={isLoading}
                >
                  {[15, 30, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span className={styles.rowsInfo}>
                  Mostrando {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, users.length)} de {users.length} registros
                </span>
              </div>

              <div className={styles.pagination}>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1 || isLoading}
                  className={styles.paginationButton}
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      disabled={isLoading}
                      className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.active : ''}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className={styles.paginationEllipsis}>...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      disabled={isLoading}
                      className={`${styles.paginationButton} ${currentPage === totalPages ? styles.active : ''}`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages || isLoading}
                  className={styles.paginationButton}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Chatbot */}
        <div className={styles.chatbotContainer}>
          <img src={ChatbotIcon} alt="Chatbot" className={styles.chatbotIcon} onClick={toggleChat} />
          {isChatOpen && (
            <div className={styles.chatWindow}>
              <div className={styles.chatHeader}>
                <h4>Chat de Soporte</h4>
                <button onClick={toggleChat} className={styles.closeChat}>&times;</button>
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
    </div>
  );
};



export default Usuarios;