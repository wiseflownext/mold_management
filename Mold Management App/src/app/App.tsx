import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        offset={16}
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '12px',
            maxWidth: '340px',
          },
        }}
      />
    </AuthProvider>
  );
}
