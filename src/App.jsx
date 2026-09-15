import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Package, Plus, Search, Trash2, PlusCircle, MinusCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Abarrotes');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('3');

  // Escuchar cambios en tiempo real desde Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(docs);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  // Agregar un producto nuevo
  const agregarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !precio || !stock) return;

    await addDoc(collection(db, "productos"), {
      nombre: nombre.trim(),
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock, 10),
      stockMinimo: parseInt(stockMinimo, 10),
      creadoEn: serverTimestamp()
    });

    setNombre('');
    setPrecio('');
    setStock('');
  };

  // Sumar / Restar stock
  const cambiarStock = async (id, stockActual, cambio) => {
    const nuevoStock = Math.max(0, stockActual + cambio);
    const prodRef = doc(db, "productos", id);
    await updateDoc(prodRef, { stock: nuevoStock });
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (confirm("¿Deseas eliminar este producto del inventario?")) {
      await deleteDoc(doc(db, "productos", id));
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Control de Inventario</h1>
              <p className="text-sm text-slate-500">Actualización en tiempo real</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </header>

        {/* Formulario de Registro */}
        <form onSubmit={agregarProducto} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Nuevo Producto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input 
              type="text" 
              placeholder="Nombre del producto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <select 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Abarrotes">Abarrotes</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Lácteos">Lácteos</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Otros">Otros</option>
            </select>
            <input 
              type="number" 
              step="0.01" 
              placeholder="Precio ($)"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input 
              type="number" 
              placeholder="Cantidad"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
        </form>

        {/* Tabla de Productos */}
        <main className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {cargando ? (
            <p className="p-6 text-center text-slate-500">Cargando inventario...</p>
          ) : productosFiltrados.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No hay productos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Producto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {productosFiltrados.map((item) => {
                    const stockBajo = item.stock <= (item.stockMinimo || 3);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {stockBajo && <AlertTriangle className="w-4 h-4 text-amber-500" title="Stock bajo" />}
                            {item.nombre}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{item.categoria}</td>
                        <td className="p-4 font-semibold">${parseFloat(item.precio).toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => cambiarStock(item.id, item.stock, -1)}
                              className="text-slate-400 hover:text-red-600 transition"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                              stockBajo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.stock}
                            </span>
                            <button 
                              onClick={() => cambiarStock(item.id, item.stock, 1)}
                              className="text-slate-400 hover:text-emerald-600 transition"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => eliminarProducto(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}