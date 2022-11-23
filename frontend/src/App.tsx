import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthPage } from "./pages/Auth";
import { BookingsPage } from "./pages/Bookings";
import { EventsPage } from "./pages/Events";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={null} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
