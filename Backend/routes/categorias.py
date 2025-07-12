import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FaPowerOff, FaChevronLeft, FaChevronRight, FaChevronDown, FaSearch, FaFilter, FaPlus, FaSpinner, FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization, FcPrint } from "react-icons/fc";
import axios from "axios";
import styles from "../styles/Usuarios.module.css";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";

const Categorias = () => {
  // Estados para UI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [menuState, setMenuState] = useState({
    support: false,
    admin: false,
    config: false
  });

  // Estados para datos
  const [showForm, setShowForm] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre_categoria");
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
    nombre_categoria: '',
    descripcion: ''
  });

  // Efectos
  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchField, searchTerm, additionalFilters, categorias]);

  // Funciones de ayuda
  const applyFilters = () => {
    let result = [...categorias];

    if (searchField && searchTerm) {
      result = result.filter(categoria => {
        const value = categoria[searchField];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    additionalFilters.forEach(filter => {
      if (filter.field && filter.value) {
        result = result.filter(categoria => {
          const value = categoria[filter.field];
          return value?.toString().toLowerCase().includes(filter.value.toLowerCase());
        });
      }
    });

    setFilteredCategorias(result);
    setCurrentPage(1);
  };

  const toggleMenu = (menu) => {
    setMenuState(prev => {
      const newState = { support: false, admin: false, config: false };
      if (menu) newState[menu] = !prev[menu];
      return newState;
    });
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleMainMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleExportDropdown = () => setIsExportDropdownOpen(!isExportDropdownOpen);

  // Funciones de exportación
  const exportToExcel = () => {
    console.log("Exportando a Excel", filteredCategorias);
    setIsExportDropdownOpen(false);
  };

  const exportToPdf = () => {
    console.log("Exportando a PDF", filteredCategorias);
    setIsExportDropdownOpen(false);
  };

  const exportToCsv = () => {
    console.log("Exportando a CSV", filteredCategorias);
    setIsExportDropdownOpen(false);
  };

  const printTable = () => {
    window.print();
    setIsExportDropdownOpen(false);
  };

  // Funciones de API
  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/categorias/obtener");
      setCategorias(response.data);
      setFilteredCategorias(response.data);
    } catch (error) {
      console.error("Error al cargar categorias:", error);
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
        ? `http://localhost:5000/categorias/actualizacion/${editingId}`
        : 'http://localhost:5000/categorias/creacion';

      const response = await axios[method.toLowerCase()](url, formData);

      if (response.data.success) {
        alert(editingId ? 'Categoría actualizada' : 'Categoría creada');
        resetForm();
        fetchCategorias();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;

    try {
      const response = await axios.delete(`http://localhost:5000/categorias/eliminar/${id}`);
      if (response.data.success) {
        alert("Categoría eliminada");
        fetchCategorias();
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
    const requiredFields = ['nombre_categoria'];
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
      nombre_categoria: '',
      descripcion: ''
    });
    setEditingId(null);
    setFormErrors({});
    setShowForm(false);
  };

  const handleEdit = (categoria) => {
    setFormData({
      nombre_categoria: categoria.nombre_categoria,
      descripcion: categoria.descripcion || ''
    });
    setEditingId(categoria.id_categoria);
    setShowForm(true);
  };

  // Funciones de filtrado
  const addFilterField = () => {
    setAdditionalFilters([...additionalFilters, { field: 'nombre_categoria', value: '' }]);
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
    fetchCategorias();
  };

  // Funciones de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredCategorias.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredCategorias.length / rowsPerPage);

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
              {userRole === 'administrador' ? (
                <>
                  <li className={styles.iconosMenu}>
                    <Link to="/HomeAdmiPage" className={styles.linkSinSubrayado}>
                      <FcHome className={styles.menuIcon} />
                      <span className={styles.menuText}>Inicio</span>
                    </Link>
                  </li>
                  <li className={styles.iconosMenu}>
                    <div className={styles.linkSinSubrayado} onClick={() => toggleMenu('support')}>
                      <FcAssistant className={styles.menuIcon} />
                      <span className={styles.menuText}> Soporte</span>
                    </div>
                    <ul className={`${styles.submenu} ${menuState.support ? styles.showSubmenu : ''}`}>
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
                    <div className={styles.linkSinSubrayado} onClick={() => toggleMenu('admin')}>
                      <FcBusinessman className={styles.menuIcon} />
                      <span className={styles.menuText}> Administración</span>
                    </div>
                    <ul className={`${styles.submenu} ${menuState.admin ? styles.showSubmenu : ''}`}>
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
                    <div className={styles.linkSinSubrayado} onClick={() => toggleMenu('config')}>
                      <FcAutomatic className={styles.menuIcon} />
                      <span className={styles.menuText}> Configuración</span>
                    </div>
                    <ul className={`${styles.submenu} ${menuState.config ? styles.showSubmenu : ''}`}>
                      <li>
                        <Link to="/Categorias" className={styles.submenuLink}>
                          <FcGenealogy className={styles.menuIcon} />
                          <span className={styles.menuText}>Categorias</span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                </>
              ) : userRole === 'tecnico' ? (
                <>
                  <li className={styles.iconosMenu}>
                    <Link to="/HomeTecnicoPage" className={styles.linkSinSubrayado}>
                      <FcHome className={styles.menuIcon} />
                      <span className={styles.menuText}>Inicio</span>
                    </Link>
                  </li>
                  <li className={styles.iconosMenu}>
                    <div className={styles.linkSinSubrayado} onClick={() => toggleMenu('support')}>
                      <FcAssistant className={styles.menuIcon} />
                      <span className={styles.menuText}> Soporte</span>
                    </div>
                    <ul className={`${styles.submenu} ${menuState.support ? styles.showSubmenu : ''}`}>
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
                    <div className={styles.linkSinSubrayado} onClick={() => toggleMenu('admin')}>
                      <FcBusinessman className={styles.menuIcon} />
                      <span className={styles.menuText}> Administración</span>
                    </div>
                    <ul className={`${styles.submenu} ${menuState.admin ? styles.showSubmenu : ''}`}>
                      <li>
                        <Link to="/Usuarios" className={styles.submenuLink}>
                          <FcPortraitMode className={styles.menuIcon} />
                          <span className={styles.menuText}> Usuarios</span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
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
                </>
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
      <div style={{
        marginLeft: isMenuExpanded ? "200px" : "60px",
        transition: "margin-left 0.3s ease"
      }}>
        <Outlet />
      </div>

      {/* Header */}
      <header className={styles.containerInicio} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        <div className={styles.containerInicioImg}>
          <Link to={userRole === 'administrador' ? '/HomeAdmiPage' : userRole === 'tecnico' ? '/HomeTecnicoPage' : '/home'} className={styles.linkSinSubrayado}>
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

      {/* Contenido */}
      <div className={styles.container} style={{
        marginLeft: isMenuExpanded ? "200px" : "60px"
      }}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <FaSpinner className={styles.spinner} />
          </div>
        )}

        <div className={styles.topControls}>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className={styles.addButton}
          >
            <FaPlus /> {showForm ? 'Ver Categorías' : 'Agregar Categoría'}
          </button>
        </div>

        {showForm ? (
          <div className={styles.containerUsuarios}>
            <h2 className={styles.titulo}>
              {editingId ? 'Editar Categoría' : 'Formulario de Creación de Categoría'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.gridContainerUsuarios}>
                <div className={styles.columna}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre de la Categoría</label>
                    <input
                      type="text"
                      className={`${styles.input} ${formErrors.nombre_categoria ? styles.inputError : ''}`}
                      name="nombre_categoria"
                      value={formData.nombre_categoria}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.nombre_categoria && <span className={styles.errorMessage}>{formErrors.nombre_categoria}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Descripción</label>
                    <textarea
                      className={styles.input}
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows="3"
                    />
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
        ) : (
          <>
            <div className={styles.searchSection}>
              <h2 className={styles.sectionTitle}>Buscar Categorías</h2>
              <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.mainSearch}>
                  <div className={styles.searchFieldGroup}>
                    <select
                      className={styles.searchSelect}
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="nombre_categoria">Nombre</option>
                      <option value="descripcion">Descripción</option>
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
                    Categorías
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
                      <option value="nombre_categoria">Nombre</option>
                      <option value="descripcion">Descripción</option>
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

                <div className={styles.exportDropdown}>
                  <button
                    onClick={toggleExportDropdown}
                    className={styles.exportButton}
                    title="Opciones de exportación"
                  >
                    Exportar <FaChevronDown className={styles.dropdownIcon} />
                  </button>
                  {isExportDropdownOpen && (
                    <div
                      className={styles.exportDropdownContent}
                      onMouseLeave={() => setIsExportDropdownOpen(false)}
                    >
                      <button onClick={exportToExcel} className={styles.exportOption}>
                        <FaFileExcel /> Excel
                      </button>
                      <button onClick={exportToPdf} className={styles.exportOption}>
                        <FaFilePdf /> PDF
                      </button>
                      <button onClick={exportToCsv} className={styles.exportOption}>
                        <FaFileCsv /> CSV
                      </button>
                      <button onClick={printTable} className={styles.exportOption}>
                        <FcPrint /> Imprimir
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className={styles.usersTableContainer}>
              <h2 className={styles.sectionTitle}>Categorías Registradas ({filteredCategorias.length})</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="3" className={styles.loadingCell}>
                          <FaSpinner className={styles.spinner} /> Cargando categorías...
                        </td>
                      </tr>
                    ) : currentRows.length > 0 ? (
                      currentRows.map((categoria) => (
                        <tr key={categoria.id_categoria}>
                          <td>{categoria.nombre_categoria}</td>
                          <td>{categoria.descripcion || '-'}</td>
                          <td>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleEdit(categoria)}
                            >
                              Editar
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() => handleDelete(categoria.id_categoria)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className={styles.noUsers}>No se encontraron categorías</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
                  Mostrando {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredCategorias.length)} de {filteredCategorias.length} registros
                </span>
              </div>

              <div className={styles.pagination}>
                <button
                  className={`${styles.paginationButton} ${currentPage === 1 || isLoading ? styles.disabled : ''}`}
                  onClick={prevPage}
                  disabled={currentPage === 1 || isLoading}
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.active : ''}`}
                      onClick={() => paginate(pageNumber)}
                      disabled={isLoading}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className={styles.paginationEllipsis}>...</span>
                    <button
                      className={`${styles.paginationButton} ${currentPage === totalPages ? styles.active : ''}`}
                      onClick={() => paginate(totalPages)}
                      disabled={isLoading}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className={`${styles.paginationButton} ${currentPage === totalPages || isLoading ? styles.disabled : ''}`}
                  onClick={nextPage}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}

        <div className={styles.chatbotContainer}>
          <img src={ChatbotIcon} alt="Chatbot" className={styles.chatbotIcon} onClick={() => setIsChatOpen(!isChatOpen)} />
          {isChatOpen && (
            <div className={styles.chatWindow}>
              <div className={styles.chatHeader}>
                <h4>Chat de Soporte</h4>
                <button onClick={() => setIsChatOpen(false)} className={styles.closeChat}>&times;</button>
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

export default Categorias;
