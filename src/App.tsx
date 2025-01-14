import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CompleteProfile from "@/pages/CompleteProfile";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import TeacherDashboard from "@/pages/dashboard/TeacherDashboard";
import StudentDashboard from "@/pages/dashboard/StudentDashboard";
import AdminProfile from "@/pages/profile/AdminProfile";
import TeacherProfile from "@/pages/profile/TeacherProfile";
import StudentProfile from "@/pages/profile/StudentProfile";
import Courses from "@/pages/Courses";
import CourseDetails from "@/pages/CourseDetails";
import CourseLearn from "@/pages/CourseLearn";
import ManageUsers from "@/pages/admin/ManageUsers";
import UserList from "@/pages/admin/UserList";
import CourseList from "@/pages/admin/CourseList";
import CreateCourse from "@/pages/admin/CreateCourse";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseDetails />} />
                <Route path="/course/:courseId/learn" element={
                  <ProtectedRoute requiredRole="student">
                    <CourseLearn />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/complete-profile" element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                } />
                
                {/* Dashboard Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/dashboard"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/profile"
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserList />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/users/manage" element={
                  <ProtectedRoute requiredRole="admin">
                    <ManageUsers />
                  </ProtectedRoute>
                } />
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CourseList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/new"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;