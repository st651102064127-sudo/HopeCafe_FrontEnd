import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider, Route, Link } from 'react-router-dom'
import Categories from './assets/Admin/categories';
import Food from './assets/Admin/food';
import QueueManagement from './assets/User/queue';
import Index from './assets/customer/index';
import Playment from './assets/User/payment'
import Employee from './assets/Admin/Employee'
import Login  from './assets/User/Login'
import EmployeeSession from './assets/Admin/session'
import Dashboard from './assets/Admin/Dashboard';
const router = createBrowserRouter([
  {
    path: '/categories',
    element: <Categories />,
  },
  {
    path: '/food',
    element: <Food />
  },
  {
    path: '/Queue',
    element: <QueueManagement />
  }
  ,
  {
    path: '/index',
    element: <Index />
  },
  {
    path: '/payment',
    element: <Playment />
  },
  {
    path: '/Employee',
    element: <Employee />
  },{
    path: '/Login',
    element : <Login />
  },{
    path: '/EmployeeSession',
    element : <EmployeeSession />
  },
  {path : '/Dashboard',
    element : <Dashboard />
  }
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
