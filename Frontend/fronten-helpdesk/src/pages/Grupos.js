import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaPlus, FaSpinner } from "react-icons/fa";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import axios from "axios";
import styles from "../styles/Usuarios.module.css";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";

// Componentes reutilizables
const FormGroup = ({ label, children, error }) => (
  <div className={styles.formGroup}>
    {label && <label className={styles.label}>{label}</label>}
    {children}
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);

const ActionButton = ({ onClick, children, disabled = false, isDelete = false }) => (
  <button
    className={`${styles.actionButton} ${isDelete ? styles.deleteButton : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const PaginationButton = ({ onClick, children, disabled = false, isActive = false }) => (
  <button
    className={`${styles.paginationButton} ${isActive ? styles.active : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Componente principal
const Grupos = () => {
  // Estados para UI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuState, setMenuState] = useState({
    support: false,
    admin: false,
    config: false
  });

  // Estados para datos
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre");
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Datos del usuario
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol") || "";

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    entidad: '',
    activo: 'si',
    descripcion: ''
  });

  // Efectos
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchField, searchTerm, additionalFilters, users]);

  // Funciones de ayuda
  const applyFilters = () => {
    let result = [...users];

    if (searchField && searchTerm) {
      result = result.filter(user => {
        const value = user[searchField];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    additionalFilters.forEach(filter => {
      if (filter.field && filter.value) {
        result = result.filter(user => {
          const value = user[filter.field];
          return value?.toString().toLowerCase().includes(filter.value.toLowerCase());
        });
      }
    });

    setFilteredUsers(result);
    setCurrentPage(1);
  };

  // Funciones de API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/grupos/obtener");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/grupos/actualizacion/${editingId}`
        : 'http://localhost:5000/grupos/creacion';

      const response = await axios[method.toLowerCase()](url, formData);
      
      if (response.data.success) {
        alert(editingId ? 'Grupo actualizado' : 'Grupo creado');
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este grupo?")) return;

    try {
      const response = await axios.delete(`http://localhost:5000/grupos/eliminar/${id}`);
      if (response.data.success) {
        alert("Grupo eliminado");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Funciones de formulario
  const validateField = (name, value) => {
    const newErrors = { ...formErrors };
    
    if (!value?.trim()) {
      newErrors[name] = `${name} es requerido`;
    } else {
      delete newErrors[name];
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const requiredFields = ['nombre', 'entidad'];
    const isValid = requiredFields.every(field => {
      validateField(field, formData[field]);
      return formData[field]?.trim();
    });

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      entidad: '',
      activo: 'si',
      descripcion: ''
    });
    setEditingId(null);
    setFormErrors({});
    setShowForm(false);
  };

  const handleEdit = (group) => {
    setFormData({
      nombre: group.nombre,
      entidad: group.entidad,
      activo: group.activo,
      descripcion: group.descripcion
    });
    setEditingId(group.id_grupo);
    setShowForm(true);
  };

  // Funciones de filtrado
  const addFilterField = () => {
    setAdditionalFilters([...additionalFilters, { field: 'nombre', value: '' }]);
  };

  const handleFilterChange = (index, field, value) => {
    const updated = [...additionalFilters];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalFilters(updated);
  };

  const removeFilter = (index) => {
    const updated = [...additionalFilters];
    updated.splice(index, 1);
    setAdditionalFilters(updated);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setAdditionalFilters([]);
    fetchUsers();
  };

  // Funciones de UI
  const toggleMenu = (menu) => {
    setMenuState(prev => {
      const newState = { support: false, admin: false, config: false };
      if (menu) newState[menu] = !prev[menu];
      return newState;
    });
  };

  // Funciones de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginate = (page) => setCurrentPage(page);
  const nextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Renderizado condicional
  if (!['administrador', 'tecnico'].includes(userRole)) {
    return (
      <div className={styles.accessDenied}>
        <h2>Acceso restringido</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <Link to="/" className={styles.returnLink}>Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      {/* Menú Vertical */}
      <MenuVertical 
        isMenuExpanded={isMenuExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        menuState={menuState}
        toggleMenu={toggleMenu}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        toggleMainMenu={() => setIsMenuExpanded(!isMenuExpanded)}
        userRole={userRole}
      />

      {/* Contenido principal */}
      <div style={{ 
        marginLeft: isMenuExpanded ? "200px" : "60px", 
        transition: "margin-left 0.3s ease" 
      }}>
        <Outlet />
      </div>

      {/* Header */}
      <Header 
        userRole={userRole}
        nombre={nombre}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
        isMenuExpanded={isMenuExpanded}
      />

      {/* Contenido */}
      <div className={styles.container} style={{ 
        marginLeft: isMenuExpanded ? "200px" : "60px" 
      }}>
        {isLoading && <LoadingOverlay />}

        <div className={styles.topControls}>
          <button 
            onClick={() => { resetForm(); setShowForm(!showForm); }} 
            className={styles.addButton}
          >
            <FaPlus /> {showForm ? 'Ver Grupos' : 'Agregar Grupo'}
          </button>
        </div>

        {showForm ? (
          <GroupForm 
            formData={formData}
            formErrors={formErrors}
            editingId={editingId}
            isLoading={isLoading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
          />
        ) : (
          <>
            <SearchSection
              searchField={searchField}
              searchTerm={searchTerm}
              additionalFilters={additionalFilters}
              isLoading={isLoading}
              setSearchField={setSearchField}
              setSearchTerm={setSearchTerm}
              handleFilterChange={handleFilterChange}
              removeFilter={removeFilter}
              addFilterField={addFilterField}
              resetSearch={resetSearch}
            />

            <GroupsTable 
              currentRows={currentRows}
              isLoading={isLoading}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              filteredUsers={filteredUsers}
              indexOfFirstRow={indexOfFirstRow}
              indexOfLastRow={indexOfLastRow}
              handleRowsPerPageChange={handleRowsPerPageChange}
              paginate={paginate}
              prevPage={prevPage}
              nextPage={nextPage}
              isLoading={isLoading}
            />
          </>
        )}

        <Chatbot 
          isChatOpen={isChatOpen}
          toggleChat={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
    </div>
  );
};

// Componentes reutilizables separados
const MenuVertical = ({ isMenuExpanded, isMobileMenuOpen, menuState, toggleMenu, toggleMobileMenu, toggleMainMenu, userRole }) => {
  const menuItems = {
    administrador: [
      { path: "/HomeAdmiPage", icon: <FcHome />, text: "Inicio" },
      { 
        text: "Soporte", 
        icon: <FcAssistant />,
        subItems: [
          { path: "/Tickets", icon: <FcAnswers />, text: "Tickets" },
          { path: "/CrearCasoAdmin", icon: <FcCustomerSupport />, text: "Crear Caso" },
          { path: "/Estadisticas", icon: <FcBullish />, text: "Estadísticas" }
        ]
      },
      {
        text: "Administración",
        icon: <FcBusinessman />,
        subItems: [
          { path: "/Usuarios", icon: <FcPortraitMode />, text: "Usuarios" },
          { path: "/Grupos", icon: <FcConferenceCall />, text: "Grupos" },
          { path: "/Entidades", icon: <FcOrganization />, text: "Entidades" }
        ]
      },
      {
        text: "Configuración",
        icon: <FcAutomatic />,
        subItems: [
          { path: "/Categorias", icon: <FcGenealogy />, text: "Categorias" }
        ]
      }
    ],
    tecnico: [
      { path: "/HomeTecnicoPage", icon: <FcHome />, text: "Inicio" },
      {
        text: "Soporte",
        icon: <FcAssistant />,
        subItems: [
          { path: "/Tickets", icon: <FcAnswers />, text: "Tickets" },
          { path: "/CrearCasoAdmin", icon: <FcCustomerSupport />, text: "Crear Caso" }
        ]
      },
      {
        text: "Administración",
        icon: <FcBusinessman />,
        subItems: [
          { path: "/Usuarios", icon: <FcPortraitMode />, text: "Usuarios" }
        ]
      }
    ],
    usuario: [
      { path: "/home", icon: <FcHome />, text: "Inicio" },
      { path: "/CrearCasoUse", icon: <FcCustomerSupport />, text: "Crear Caso" },
      { path: "/Tickets", icon: <FcAnswers />, text: "Tickets" }
    ]
  };

  return (
    <aside
      className={`${styles.menuVertical} ${isMenuExpanded ? styles.expanded : ""}`}
      onMouseEnter={toggleMainMenu}
      onMouseLeave={toggleMainMenu}
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
            {menuItems[userRole]?.map((item, index) => (
              <MenuItem 
                key={index}
                item={item}
                menuState={menuState}
                toggleMenu={toggleMenu}
              />
            ))}
          </ul>
        </div>

        <div className={styles.floatingContainer}>
          <div className={styles.menuLogoEmpresarial}>
            <img src={Logoempresarial} alt="Logo Empresarial" />
          </div>
        </div>
      </div>
    </aside>
  );
};

const MenuItem = ({ item, menuState, toggleMenu }) => {
  if (item.path) {
    return (
      <li className={styles.iconosMenu}>
        <Link to={item.path} className={styles.linkSinSubrayado}>
          {item.icon}
          <span className={styles.menuText}>{item.text}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className={styles.iconosMenu}>
      <div 
        className={styles.linkSinSubrayado} 
        onClick={() => toggleMenu(item.text.toLowerCase())}
      >
        {item.icon}
        <span className={styles.menuText}>{item.text}</span>
      </div>
      {item.subItems && (
        <ul className={`${styles.submenu} ${menuState[item.text.toLowerCase()] ? styles.showSubmenu : ''}`}>
          {item.subItems.map((subItem, subIndex) => (
            <li key={subIndex}>
              <Link to={subItem.path} className={styles.submenuLink}>
                {subItem.icon}
                <span className={styles.menuText}>{subItem.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Header = ({ userRole, nombre, searchTerm, setSearchTerm, isLoading, isMenuExpanded }) => {
  const roleToPath = {
    usuario: '/home',
    tecnico: '/HomeTecnicoPage',
    administrador: '/HomeAdmiPage'
  };

  return (
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
  );
};

const LoadingOverlay = () => (
  <div className={styles.loadingOverlay}>
    <FaSpinner className={styles.spinner} />
  </div>
);

const GroupForm = ({ formData, formErrors, editingId, isLoading, handleChange, handleSubmit, resetForm }) => (
  <div className={styles.containerUsuarios}>
    <h2 className={styles.titulo}>
      {editingId ? 'Editar Grupo' : 'Formulario de Creación de Grupo'}
    </h2>
    <form onSubmit={handleSubmit}>
      <div className={styles.gridContainerUsuarios}>
        <div className={styles.columna}>
          <FormGroup label="Nombre del Grupo" error={formErrors.nombre}>
            <input
              type="text"
              className={`${styles.input} ${formErrors.nombre ? styles.inputError : ''}`}
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <div className={styles.selectsContainer}>
            <FormGroup label="Activo">
              <select 
                className={styles.select} 
                name="activo" 
                value={formData.activo} 
                onChange={handleChange}
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </FormGroup>

            <FormGroup label="Entidad" error={formErrors.entidad}>
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
            </FormGroup>
          </div>

          <div className={styles.botonesContainer}>
            <button type="submit" className={styles.boton} disabled={isLoading}>
              {isLoading ? <FaSpinner className={styles.spinnerButton} /> : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className={styles.botonCancelar}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
);

const SearchSection = ({
  searchField,
  searchTerm,
  additionalFilters,
  isLoading,
  setSearchField,
  setSearchTerm,
  handleFilterChange,
  removeFilter,
  addFilterField,
  resetSearch
}) => (
  <div className={styles.searchSection}>
    <h2 className={styles.sectionTitle}>Buscar Grupo</h2>
    <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
      <div className={styles.mainSearch}>
        <div className={styles.searchFieldGroup}>
          <select 
            className={styles.searchSelect} 
            value={searchField} 
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="nombre">Nombre</option>
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
          Grupos
        </button>
        <button type="button" onClick={addFilterField} className={styles.addFilterButton}>
          <FaFilter /> Agregar Filtro
        </button>
      </div>

      {additionalFilters.map((filter, index) => (
        <div key={index} className={styles.additionalFilter}>
          <select
            className={styles.searchSelect}
            value={filter.field}
            onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
          >
            <option value="nombre">Nombre</option>
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
          <button 
            type="button" 
            onClick={() => removeFilter(index)} 
            className={styles.removeFilterButton}
          >
            ×
          </button>
        </div>
      ))}
    </form>
  </div>
);

const GroupsTable = ({ currentRows, isLoading, handleEdit, handleDelete }) => (
  <div className={styles.usersTableContainer}>
    <h2 className={styles.sectionTitle}>Grupos Registrados ({currentRows.length})</h2>
    <div className={styles.tableWrapper}>
      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Entidad</th>
            <th>Activo</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className={styles.loadingCell}>
                <FaSpinner className={styles.spinner} /> Cargando grupos...
              </td>
            </tr>
          ) : currentRows.length > 0 ? (
            currentRows.map((group) => (
              <tr key={group.id_grupo}>
                <td>{group.nombre}</td>
                <td>{group.entidad}</td>
                <td>{group.activo === 'si' ? 'Sí' : 'No'}</td>
                <td>{group.descripcion || '-'}</td>
                <td>
                  <ActionButton onClick={() => handleEdit(group)}>
                    Editar
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(group.id_grupo)} isDelete>
                    Eliminar
                  </ActionButton>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className={styles.noUsers}>No se encontraron grupos</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  filteredUsers,
  indexOfFirstRow,
  indexOfLastRow,
  handleRowsPerPageChange,
  paginate,
  prevPage,
  nextPage,
  isLoading
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages.map(number => (
      <PaginationButton
        key={number}
        onClick={() => paginate(number)}
        disabled={isLoading}
        isActive={currentPage === number}
      >
        {number}
      </PaginationButton>
    ));
  };

  return (
    <div className={styles.paginationControls}>
      <div className={styles.rowsPerPageSelector}>
        <span>Filas por página:</span>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className={styles.rowsSelect}
          disabled={isLoading}
        >
          {[15, 30, 50, 100].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <span className={styles.rowsInfo}>
          Mostrando {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredUsers.length)} de {filteredUsers.length} registros
        </span>
      </div>

      <div className={styles.pagination}>
        <PaginationButton 
          onClick={prevPage} 
          disabled={currentPage === 1 || isLoading}
        >
          <FaChevronLeft />
        </PaginationButton>

        {renderPageNumbers()}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className={styles.paginationEllipsis}>...</span>
            <PaginationButton
              onClick={() => paginate(totalPages)}
              disabled={isLoading}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationButton>
          </>
        )}

        <PaginationButton
          onClick={nextPage}
          disabled={currentPage === totalPages || isLoading}
        >
          <FaChevronRight />
        </PaginationButton>
      </div>
    </div>
  );
};

const Chatbot = ({ isChatOpen, toggleChat }) => (
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
);

export default Grupos;