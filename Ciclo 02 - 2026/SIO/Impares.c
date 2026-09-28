#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <time.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <mqueue.h>

#define COLA_NOMBRE "/cola_sio115"
#define PRIORIDAD_IMPARES 2
#define CANTIDAD_NUMEROS 10

int main(void){
	// Mostrar encabezado, apellidos y PID del proceso
	printf("=========================================\n");
	printf("            PROGRAMA IMPARES.C           \n");
	printf("=========================================\n");
	printf("Apellidos: Vasquez Menjivar - VM15037\n");
	printf("PID      : %d\n\n", getpid());

	printf("Prioridad de ingreso a la cola: MEDIA (%d)\n", PRIORIDAD_IMPARES);

	// Inicializar semilla aleatoria mezclando tiempo + PID
	// Se usa XOR con PID desplazado para que dos procesos
	// ejecutados en el mismo segundo generen numeros distintos
	srand(time(NULL) ^ (getpid() << 16));

	// Generar 10 numeros impares NO consecutivos
	int impares[CANTIDAD_NUMEROS];
	// Primer impar aleatorio entre 1, 3, 5, 7 o 9
	// (rand()%5)*2 genera un par (0,2,4,6,8) y al sumarle 1 se vuelve impar
	int actual = ((rand() % 5) * 2) + 1;

	printf("Numeros impares generados (%d):\n", CANTIDAD_NUMEROS);
	for(int i = 0; i < CANTIDAD_NUMEROS; i++){
		impares[i] = actual;
		printf("%d ", impares[i]);
		// Salto par aleatorio de 4, 6, 8 o 10 unidades
		// Al sumar un numero par a un impar, el resultado siempre es impar
		// Como el salto minimo es 4 (mayor que 2), nunca seran consecutivos
		int salto = ((rand() % 4) + 2) * 2;
		actual += salto;
	}
	printf("\n\n");

	// Abrir (o crear) la cola de mensajes POSIX
	// O_WRONLY = solo escritura, O_CREAT = crear si no existe
	mqd_t cola = mq_open(COLA_NOMBRE, O_WRONLY | O_CREAT, 0664, NULL);
	if(cola == (mqd_t)-1){
		perror("Error al abrir la cola de mensajes");
		return 1;
	}

	// Enviar el arreglo completo como UN SOLO mensaje binario
	// (char *)impares = casteo del puntero int* a char* (mq_send espera char*)
	// sizeof(impares) = 10 enteros x 4 bytes = 40 bytes totales
	printf("Enviando arreglo de %ld bytes a la cola...\n", sizeof(impares));
	if(mq_send(cola, (char *)impares, sizeof(impares), PRIORIDAD_IMPARES) == -1){
		perror("Error al enviar datos a la cola");
		mq_close(cola);
		return 1;
	}

	printf("Arreglo depositado correctamente en la cola.\n");
	printf("Prioridad asignada: %d (MEDIA)\n", PRIORIDAD_IMPARES);

	// Cerrar el descriptor de la cola (los datos persisten en el kernel)
	mq_close(cola);
	return 0;
}
