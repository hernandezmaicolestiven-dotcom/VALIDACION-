let usuario = document.getElementById("usuario");
let mensaje = document.getElementById("mensaje");
let password = document.getElementById("password");
let mensajePassword = document.getElementById("mensajePassword");

usuario.addEventListener("input", function () {

    let valor = this.value;
    // permitir letras, números, guion (-), guion bajo (_) y punto (.)
    // prohibir otros caracteres especiales
    if (/[^a-zA-Z0-9._-]/.test(valor)) {
        this.style.border = "2px solid red";
        mensaje.textContent = "Caracteres no permitidos";
        mensaje.style.color = "red";
    } else if (valor.length < 3) {
        this.style.border = "2px solid red";
        mensaje.textContent = "Usuario debe tener mínimo 3 caracteres";
        mensaje.style.color = "red";
    } else {
        this.style.border = "2px solid green";
        mensaje.textContent = "Usuario válido";
        mensaje.style.color = "green";
    }

    // eliminar caracteres no permitidos mientras el usuario escribe
    this.value = valor.replace(/[^a-zA-Z0-9._-]/g, '');
});

function validarFortalezaPassword(valor) {
    const requisitos = {
        longitud: valor.length >= 10,
        mayuscula: /[A-Z]/.test(valor),
        minuscula: /[a-z]/.test(valor),
        numero: /[0-9]/.test(valor),
        especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(valor)
    };
    
    const faltantes = [];
    if (!requisitos.longitud) faltantes.push("Mínimo 10 caracteres");
    if (!requisitos.mayuscula) faltantes.push("Una mayúscula");
    if (!requisitos.minuscula) faltantes.push("Una minúscula");
    if (!requisitos.numero) faltantes.push("Un número");
    if (!requisitos.especial) faltantes.push("Un carácter especial");
    
    return { cumpleRequisitos: faltantes.length === 0, faltantes };
}

password.addEventListener("input", function () {
    let valor = this.value;
    const contador = document.getElementById('passwordCounter');
    if (contador) {
        contador.textContent = valor.length;
    }

    const validacion = validarFortalezaPassword(valor);
    
    if (!validacion.cumpleRequisitos) {
        this.style.border = "2px solid red";
        mensajePassword.textContent = "Falta: " + validacion.faltantes.join(", ");
        mensajePassword.style.color = "red";
    } else {
        this.style.border = "2px solid green";
        mensajePassword.textContent = "Contraseña válida";
        mensajePassword.style.color = "green";
    }
});

const togglePasswordBtn = document.getElementById('togglePassword');
let passwordVisible = false;

if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
        passwordVisible = !passwordVisible;
        if (passwordVisible) {
            password.type = 'text';
            togglePasswordBtn.textContent = '👁‍🗨';
        } else {
            password.type = 'password';
            togglePasswordBtn.textContent = '👁';
        }
    });
}

const form = document.getElementById('formulario');
let intentosFallidos = 0;
let formularioBlocked = false;
let tiempoBloqueo = 30;

function bloquearFormulario() {
    formularioBlocked = true;
    usuario.disabled = true;
    password.disabled = true;
    const btnEnviar = form.querySelector('button[type="submit"]');
    if (btnEnviar) btnEnviar.disabled = true;
    
    let tiempoRestante = tiempoBloqueo;
    const intervalo = setInterval(() => {
        tiempoRestante--;
        const btnEnviar = form.querySelector('button[type="submit"]');
        if (btnEnviar) {
            btnEnviar.textContent = `Enviar (${tiempoRestante}s)`;
        }
        
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            desbloquearFormulario();
        }
    }, 1000);
}

function desbloquearFormulario() {
    formularioBlocked = false;
    usuario.disabled = false;
    password.disabled = false;
    const btnEnviar = form.querySelector('button[type="submit"]');
    if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar';
    }
    intentosFallidos = 0;
}

form.addEventListener('submit', e => {
    e.preventDefault();
    
    if (formularioBlocked) {
        return;
    }
    
    document.getElementById('formAlert')?.remove();

    let ok = true;
    let errores = [];

    if (!/^[a-zA-Z0-9._-]{3,}$/.test(usuario.value.trim())) {
        ok = false;
        usuario.style.border = "2px solid red";
        mensaje.textContent = "Usuario inválido";
        mensaje.style.color = "red";
        errores.push("Usuario inválido");
    } else {
        usuario.style.border = "2px solid green";
        mensaje.textContent = "Usuario válido";
        mensaje.style.color = "green";
    }

    if (!validarFortalezaPassword(password.value).cumpleRequisitos) {
        ok = false;
        password.style.border = "2px solid red";
        mensajePassword.textContent = "Contraseña no cumple requisitos de fortaleza";
        mensajePassword.style.color = "red";
        errores.push("Contraseña no cumple requisitos");
    } else {
        password.style.border = "2px solid green";
        mensajePassword.textContent = "Contraseña válida";
        mensajePassword.style.color = "green";
    }

    const div = document.createElement('div');
    div.id = 'formAlert';
    
    if (ok) {
        div.className = 'alert alert-success mt-3';
        div.textContent = '✓ Formulario enviado correctamente';
        form.appendChild(div);
        
        // Limpiar el formulario
        usuario.value = '';
        password.value = '';
        usuario.style.border = '';
        password.style.border = '';
        mensaje.textContent = '';
        mensajePassword.textContent = '';
        const contador = document.getElementById('passwordCounter');
        if (contador) contador.textContent = '0';
        
        intentosFallidos = 0;
    } else {
        intentosFallidos++;
        div.className = 'alert alert-danger mt-3';
        div.textContent = `✗ Error: ${errores.join(', ')} (Intento fallido ${intentosFallidos}/3)`;
        form.appendChild(div);
        
        if (intentosFallidos >= 3) {
            const divBloqueo = document.createElement('div');
            divBloqueo.id = 'formBlockAlert';
            divBloqueo.className = 'alert alert-warning mt-2';
            divBloqueo.textContent = '⚠️ Formulario bloqueado por 30 segundos tras 3 intentos fallidos';
            form.appendChild(divBloqueo);
            bloquearFormulario();
        }
    }
});
