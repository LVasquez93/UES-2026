package com.dentalcare.api.repositories;

import com.dentalcare.api.models.Rol;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface RolRepository extends JpaRepository<Rol, Integer> {
    //Con solo esta interfaz, ya tenemos acceso a métodos como CRUD completo, Paginación y ordenamiento, 
    // Operaciones batch y flush, Queries dinámicas por ejemplo, Generación automática de consultas por nombre de método
    
}
