import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Footer() {
  return (
        <Container style={{ backgroundColor: '#343a40', color: '#f8f9fa', padding: '10px 0' }} fluid  expand="lg" data-bs-theme="dark" className="fixed-bottom">
          <Row>
            <Col>
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p style={{ margin: 0 }}>
                  <strong>Kontaktai:</strong> 
                  <span> El. paštas: arejur@ktu.lt, </span>
                  <span> Telefonas: +370 63418707, </span>
                  <span> Adresas: Pašilės g. 39, Kaunas, Lietuva</span>
                </p>
                <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic' }}>
                  &copy; {new Date().getFullYear()} Ūkio valdymo sistema. Visos teisės saugomos.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
  );
}

export default Footer;
