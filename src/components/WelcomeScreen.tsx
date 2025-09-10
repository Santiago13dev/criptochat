/**componente de la pantalla de bienvenida que muestra el logo, titulo, descripcion y boton para comenzar*/
/** funcion que maneja el inicio de sesion */
export function WelcomeScreen({ onStart }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">CriptoChat</h1>
        <p className="text-xl text-gray-400 mb-8">
          Mensajería con encriptación de extremo a extremo
        </p>
        
        <button
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}