import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,

            success: {
              style: {
                background: "#ECFDF5",
                color: "#065F46",
                border: "1px solid #A7F3D0",
              },
            },

            error: {
              style: {
                background: "#FEF2F2",
                color: "#991B1B",
                border: "1px solid #FECACA",
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
