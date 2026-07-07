package com.apirest.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.apirest.demo.models.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    List<Usuario> findByNombre(String nombre);

    Usuario findByEmail(String email);

    List<Usuario> findByEmailAndPassword(String email, String password);

    long countByNombre(String nombre);

    void deleteById(Long id);

    boolean existsByEmail(String email);

    
   
}