import { createBrowserRouter, redirect } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { MoldListScreen } from './components/MoldListScreen';
import { MoldDetailScreen } from './components/MoldDetailScreen';
import { AddUsageScreen } from './components/AddUsageScreen';
import { AddMaintenanceScreen } from './components/AddMaintenanceScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MaintenanceReminderScreen } from './components/MaintenanceReminderScreen';
import { MyRecordsScreen } from './components/MyRecordsScreen';
import { ReminderSettingsScreen } from './components/ReminderSettingsScreen';
import { ChangePasswordScreen } from './components/ChangePasswordScreen';
import { AboutScreen } from './components/AboutScreen';
import { SystemSettingsScreen } from './components/SystemSettingsScreen';
import { AddMoldScreen } from './components/AddMoldScreen';
import { EmployeeManagementScreen } from './components/EmployeeManagementScreen';
import { DataReportScreen } from './components/DataReportScreen';
import { WorkshopManagementScreen } from './components/WorkshopManagementScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      {
        index: true,
        loader: () => redirect('/login'),
      },
      { path: 'login', Component: LoginScreen },
      { path: 'home', Component: HomeScreen },
      { path: 'molds', Component: MoldListScreen },
      { path: 'molds/:id', Component: MoldDetailScreen },
      { path: 'add-usage', Component: AddUsageScreen },
      { path: 'add-maintenance', Component: AddMaintenanceScreen },
      { path: 'add-mold', Component: AddMoldScreen },
      { path: 'profile', Component: ProfileScreen },
      { path: 'reminders', Component: MaintenanceReminderScreen },
      { path: 'my-records', Component: MyRecordsScreen },
      { path: 'reminder-settings', Component: ReminderSettingsScreen },
      { path: 'employee-management', Component: EmployeeManagementScreen },
      { path: 'change-password', Component: ChangePasswordScreen },
      { path: 'about', Component: AboutScreen },
      { path: 'settings', Component: SystemSettingsScreen },
      { path: 'data-report', Component: DataReportScreen },
      { path: 'workshop-management', Component: WorkshopManagementScreen },
    ],
  },
]);