import { useSelector } from "react-redux";
import { Provider } from "react-redux";
import store from "../store.jsx";
import Lottie from "lottie-react";
import animationData from '../assets/Animation - 1734264156330.json';
import "./Home.css"; // Importuojamas CSS failas

const Home = () => {
  const token = useSelector((state) => state.token.value);
  //console.log("token = ", token);

  return (
    <Provider store={store}>
      <div>
        <Lottie 
          animationData={animationData} 
          style={{ maxWidth: '90%', height: 'auto' }} // Nustatykite norimą dydį
        />
      </div>
    </Provider>
  );
};

export default Home;
