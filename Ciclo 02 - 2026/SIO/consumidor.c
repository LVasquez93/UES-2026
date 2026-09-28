#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <mqueue.h>

#define COLA_NOMBRE "/cola_sio115"
#define BUF_SIZE 8192
#define CANTIDAD_NUMEROS 10

// Funcion para verificar si una palabra es palindromo
// Compara el primer caracter con el ultimo, el segundo con el penultimo, etc.
int verificar_palindromo(const char *palabra){
	int len = strlen(palabra);
	for(int i = 0; i < len / 2; i++){
		if(palabra[i] != palabra[len - 1 - i]){
			return 0; // No es palindromo
		}
	}
	return 1; // Si es palindromo
}

int main(void){
	// Mostrar encabezado, apellidos y PID del proceso
	printf("=========================================\n");
	printf("         PROGRAMA CONSUMIDOR.C           \n");
	printf("=========================================\n");
	printf("Apellidos: Vasquez Menjivar - VM15037\n");
	printf("PID      : %d\n\n", getpid());

	// Abrir la cola existente en modo SOLO LECTURA
	// No usa O_CREAT porque la cola ya debe existir (la crearon los productores)
	mqd_t cola = mq_open(COLA_NOMBRE, O_RDONLY);
	if(cola == (mqd_t)-1){
		perror("Error: No se pudo abrir la cola. Ejecute los productores primero");
		return 1;
	}

	printf("Procesando mensajes de la cola...\n\n");

	// Consultar cuantos mensajes hay actualmente en la cola
	struct mq_attr attr;
	mq_getattr(cola, &attr);
	int total_mensajes = attr.mq_curmsgs;

	if(total_mensajes == 0){
		printf("La cola esta vacia. No hay datos que procesar.\n");
		mq_close(cola);
		return 0;
	}

	// Variables para almacenar los datos recibidos
	int pares[CANTIDAD_NUMEROS];
	int impares[CANTIDAD_NUMEROS];
	char palabra[256] = "";
	int hay_pares = 0, hay_impares = 0, hay_palabra = 0;

	// Buffer generico para recibir los bytes crudos de la cola
	char buffer[BUF_SIZE];
	unsigned int prioridad;

	// Extraer TODOS los mensajes de la cola
	// mq_receive entrega automaticamente el de MAYOR prioridad primero:
	// 1ro Prioridad 3 (Pares) -> 2do Prioridad 2 (Impares) -> 3ro Prioridad 1 (Palabra)
	for(int i = 0; i < total_mensajes; i++){
		ssize_t bytes = mq_receive(cola, buffer, BUF_SIZE, &prioridad);
		if(bytes >= 0){
			if(prioridad == 3){
				// Copiar los bytes recibidos directamente al arreglo de enteros
				// memcpy copia byte a byte desde buffer hacia pares
				memcpy(pares, buffer, bytes);
				hay_pares = 1;
			} else if(prioridad == 2){
				// Copiar los bytes recibidos al arreglo de impares
				memcpy(impares, buffer, bytes);
				hay_impares = 1;
			} else if(prioridad == 1){
				// Copiar la cadena de texto (la palabra)
				strncpy(palabra, buffer, sizeof(palabra) - 1);
				hay_palabra = 1;
			}
		} else {
			perror("Error al extraer mensaje de la cola");
			break;
		}
	}

	printf("Extraccion completa. La cola ha quedado vacia.\n\n");

	// ==========================================
	// NUMEROS PARES (prioridad 3 - maxima)
	// ==========================================
	printf("--- NUMEROS PARES (prioridad: maxima) ---\n");
	if(hay_pares){
		printf("Elementos extraidos: %d\n", CANTIDAD_NUMEROS);
		printf("Numeros: ");
		double suma = 0;
		// Recorrer el arreglo directamente, los datos ya son enteros
		// No necesitamos convertir de texto a numero como con atoi()
		for(int i = 0; i < CANTIDAD_NUMEROS; i++){
			printf("%d ", pares[i]);
			suma += pares[i];
		}
		printf("\n");
		printf("Promedio: %.2f\n\n", suma / CANTIDAD_NUMEROS);
	} else {
		printf("No se encontraron numeros pares en la cola.\n\n");
	}

	// ==========================================
	// NUMEROS IMPARES (prioridad 2 - media)
	// ==========================================
	printf("--- NUMEROS IMPARES (prioridad: media) ---\n");
	if(hay_impares){
		printf("Elementos extraidos: %d\n", CANTIDAD_NUMEROS);
		printf("Numeros: ");
		double suma = 0;
		for(int i = 0; i < CANTIDAD_NUMEROS; i++){
			printf("%d ", impares[i]);
			suma += impares[i];
		}
		printf("\n");
		printf("Promedio: %.2f\n\n", suma / CANTIDAD_NUMEROS);
	} else {
		printf("No se encontraron numeros impares en la cola.\n\n");
	}

	// ==========================================
	// PALABRA (prioridad 1 - minima)
	// ==========================================
	printf("--- PALABRA (prioridad: minima) ---\n");
	if(hay_palabra){
		printf("Palabra extraida: \"%s\"\n", palabra);
		// Verificar si la palabra es palindromo
		if(verificar_palindromo(palabra)){
			printf("La palabra SI es un palindromo.\n\n");
		} else {
			printf("La palabra NO es un palindromo.\n\n");
		}
	} else {
		printf("No se encontro ninguna palabra en la cola.\n\n");
	}

	printf("=========================================\n");
	printf("Todos los mensajes han sido procesados.\n");
	printf("La cola de mensajes ha quedado vacia.\n");
	printf("=========================================\n");

	// Cerrar y DESTRUIR la cola del sistema
	// mq_close: cierra el descriptor del proceso actual
	// mq_unlink: elimina la cola del kernel para no dejar basura en /dev/mqueue/
	mq_close(cola);
	mq_unlink(COLA_NOMBRE);

	return 0;
}
