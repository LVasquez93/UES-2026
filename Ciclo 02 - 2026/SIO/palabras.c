#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <mqueue.h>

#define COLA_NOMBRE "/cola_sio115"
#define PRIORIDAD_PALABRA 1

int main(void){
	// Mostrar encabezado, apellidos y PID del proceso
	printf("=========================================\n");
	printf("           PROGRAMA PALABRAS.C           \n");
	printf("=========================================\n");
	printf("Apellidos: Vasquez Menjivar - VM15037\n");
	printf("PID      : %d\n\n", getpid());

	printf("Prioridad de ingreso a la cola: MINIMA (%d)\n", PRIORIDAD_PALABRA);

	// Solicitar palabra al usuario por teclado
	// El proceso entra en estado BLOQUEADO mientras espera la entrada del usuario
	char palabra[100];
	printf("Ingrese una palabra: ");
	scanf("%99s", palabra);
	printf("Palabra ingresada: \"%s\"\n\n", palabra);

	// Abrir (o crear) la cola de mensajes POSIX
	// O_WRONLY = solo escritura, O_CREAT = crear si no existe
	mqd_t cola = mq_open(COLA_NOMBRE, O_WRONLY | O_CREAT, 0664, NULL);
	if(cola == (mqd_t)-1){
		perror("Error al abrir la cola de mensajes");
		return 1;
	}

	// Enviar la palabra como UN SOLO mensaje
	// strlen(palabra)+1 incluye el caracter nulo '\0' de terminacion
	printf("Enviando palabra a la cola...\n");
	if(mq_send(cola, palabra, strlen(palabra) + 1, PRIORIDAD_PALABRA) == -1){
		perror("Error al enviar la palabra a la cola");
		mq_close(cola);
		return 1;
	}

	printf("Palabra depositada correctamente en la cola.\n");
	printf("Prioridad asignada: %d (MINIMA)\n", PRIORIDAD_PALABRA);

	// Cerrar el descriptor de la cola (los datos persisten en el kernel)
	mq_close(cola);
	return 0;
}
