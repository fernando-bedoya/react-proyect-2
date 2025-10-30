import React from "react";
import "../Styles/styleBoard.css";
interface PropertyProps {
    name: string;
    color: string;
    price: number;
    rent: number[];
}

const PropertyComponent: React.FC<PropertyProps> = ({name,color,price,rent }) => {
    return <div className="container">
        <div className={`row property-background-${color}`}>
            {name}
        </div>
        <div className="row">
            <div className="col">
                <p>Price: {price}</p>
                <p>Rent:</p>
                <ul>
                    {rent.map((r, index) => <li key={index}>{r}</li>)}
                </ul>
            </div>
        </div>

    </div>;
};

export default PropertyComponent;