import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import config from "../../config";
import './CategoryHouse.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

const CategoryPipeWireall = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const navigate = useNavigate();

  const pipeWireRoute = `${config.apiURL}/pipeWiresRoute/pipewires`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(pipeWireRoute);
        setData(response.data);

        // Fetch like counts
        const counts = await Promise.all(response.data.map(item =>
          axios.get(`${config.apiURL}/favourites/count/${item._id}`)
        ));
        const likeCountMap = counts.reduce((acc, curr, index) => {
          acc[response.data[index]._id] = curr.data.count;
          return acc;
        }, {});
        setLikeCounts(likeCountMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavourites = async () => {
      const userId = getUserId();
      try {
        const response = await axios.get(`${config.apiURL}/favourites/all/${userId}`);
        setFavourites(response.data);
      } catch (err) {
        console.error('Error fetching favourites:', err);
      }
    };

    fetchData();
    fetchFavourites();
  }, []);

  const getUserId = () => {
    return localStorage.getItem('userId');
  };

  const handleCardClick = (itemId) => {
    navigate(`/pipe&wireview/${itemId}`);
  };

  const handleViewDetailsClick = (itemId) => {
    navigate(`/pipe&wireview/${itemId}`);
  };

  const handleAddToFavourites = async (itemId) => {
    const userId = getUserId();

    try {
      if (favourites.includes(itemId)) {
        await axios.delete(`${config.apiURL}/favourites/remove`, { data: { userId, productId: itemId } });
        setFavourites(prevFavourites => prevFavourites.filter(id => id !== itemId));
      } else {
        await axios.post(`${config.apiURL}/favourites/add`, { userId, productId: itemId });
        setFavourites(prevFavourites => [...prevFavourites, itemId]);
      }
      
      // Update like counts
      const { data: countData } = await axios.get(`${config.apiURL}/favourites/count/${itemId}`);
      setLikeCounts(prevCounts => ({
        ...prevCounts,
        [itemId]: countData.count
      }));
    } catch (err) {
      console.error('Error updating favourites:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Navbar />
      <div className="category-container">
        <div className="header-container">
          <h2>Pipe & Wire Products</h2>
        </div>
        
        <div className="card-container">
          {data.map((item, index) => (
            <div key={item._id} className={`card ${favourites.includes(item._id) ? 'favourite' : ''}`} onClick={() => handleCardClick(item._id)}>
              <Carousel
                showThumbs={false}
                infiniteLoop
                autoPlay
                stopOnHover
                dynamicHeight
                className="carousel"
              >
                {item.images.map((photo, idx) => (
                  <div key={idx}>
                    <img src={`${config.apiURL}/${photo}`} alt={`${item.Type} ${item.name}`} />
                  </div>
                ))}
              </Carousel>
              <div className="card-content">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavourites(item._id);
                  }} 
                  className="favourite-button"
                >
                  {favourites.includes(item._id) ? (
                    <FaHeart className="favourite-icon filled" />
                  ) : (
                    <FaRegHeart className="favourite-icon" />
                  )}
                  <span className="like-count">{likeCounts[item._id] || 0} Likes</span>
                </button>
                
                {/* Conditionally Render Based on Type */}
                {item.Type === "Pipes" ? (
                  <>
                    <h3>{item.pipeBrand}</h3>
                    <p><strong>Seller Name:</strong> {item.name}</p>
                    <p><strong>Pipe Type:</strong> {item.pipeType}</p>
                    <p><strong>Diameter:</strong> {item.pipeDiameter}</p>
                    <p><strong>Length:</strong> {item.pipeLength}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Price:</strong> {item.price} RPS</p>
                  </>
                ) : item.Type === "Wires" ? (
                  <>
                    <h3>{item.wireBrand}</h3>
                    <p><strong>Seller Name:</strong> {item.name}</p>
                    <p><strong>Wire Type:</strong> {item.wireType}</p>
                    <p><strong>Diameter:</strong> {item.wireDiameter}</p>
                    <p><strong>Length:</strong> {item.wireLength}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Price:</strong> {item.price} RPS</p>
                  </>
                ) : null}
                
                <div className="card-buttons">
                  <button onClick={() => handleViewDetailsClick(item._id)} className="view-details-button">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryPipeWireall;
