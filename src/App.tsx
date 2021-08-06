import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/promise">
          <Dashboard />
        </Route>
        <Redirect to="/promise/employees" />
      </Switch>
    </Router>
  );
};

export default App;
