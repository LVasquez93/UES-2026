package com.apirest.demo.services;

import com.apirest.demo.models.Usuario;
import com.apirest.demo.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }



    public Usuario crearUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }


    public void eliminarUsuario(int id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario actualizarUsuario(int id, Usuario usuario) {
        usuario.setId(id);
        return usuarioRepository.save(usuario);
    }



    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id.intValue()).orElse(null);
    }

    
}
