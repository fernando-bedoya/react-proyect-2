import React, { useState, useEffect } from "react";
import PropertyComponent from "../components/Property";

const Demo: React.FC = () => {
    useEffect(() => {
        console.log("Component mounted");
        return () => {
            console.log("Component unmounted");
        };
    }, []);

    // Estado para el nombre
    const [name, setName] = useState("Fernando");
    // Variable para la edad
    const edad: number = 30;
    // Lista de poderes
    const poderes: string[] = ["volar", "fuerza", "velocidad"];

    // Función para manejar el cambio en el input
    const manejarCambio = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    // Función para manejar el click del botón
    const manejarClick = () => {
        console.log(`Hola, ${name}`);
    };

    return (
        <div>
            <p>Hola mundo {name}</p>
            <p>Edad: {edad}</p>
            <p>{edad >= 18 ? "Mayor de edad" : "Menor de edad"}</p>
            <p>Poderes</p>
            <ul>
                {poderes.map((poder: string) => <li key={poder}>{poder}</li>)}
            </ul>
            <input
                type="text"
                value={name}
                onChange={manejarCambio}
            />
            <button onClick={manejarClick}>Saludar</button>

            <div className="row">
            <div className="col-3">
                <PropertyComponent name="Propiedad 1" color="red" price={100} rent={[10, 20, 30]} />
            </div>
        </div>
            
        </div>
    );
}

export default Demo;