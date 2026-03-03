import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import StudentList from './components/StudentList';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Container fluid="md" className="py-4">
        <StudentList />
      </Container>
    </div>
  );
}

export default App;
