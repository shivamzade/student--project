import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import MemberList from './components/MemberList';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Container fluid="md" className="py-4">
        <MemberList />
      </Container>
    </div>
  );
}

export default App;
