// =====================================================================
//  PROGRAMACION LINEAL - Pizzeria M y M
//  Resuelve por enumeracion de vertices, imprime todo y grafica
// =====================================================================
clc; clf();

// ---------- 1. Datos del modelo ----------
c = [5, 2];                 // Maximizar Z = 5*X1 + 2*X2
A = [2.0   1.0;             // masa
     1.5   0.5;             // queso
     0.5   0.25];           // tiempo
b = [60; 40; 20];
nombres = ["Masa"; "Queso"; "Tiempo"];

mprintf("======================================================\n");
mprintf("   MODELO - Pizzeria M y M\n");
mprintf("======================================================\n");
mprintf("Objetivo:  Max Z = %g X1 + %g X2\n\n", c(1), c(2));
mprintf("Restricciones:\n");
for i = 1:size(A,1)
    mprintf("  %-7s: %5.2f X1 + %5.2f X2 <= %g\n", nombres(i), A(i,1), A(i,2), b(i));
end
mprintf("  No negat.: X1 >= 0 , X2 >= 0\n\n");

// ---------- 2. Rectas frontera (restricciones + ejes) ----------
L = [A, b];          // [a1 a2 d]  ->  a1*X1 + a2*X2 = d
L = [L; 1 0 0];      // X1 = 0
L = [L; 0 1 0];      // X2 = 0
m = size(L,1);
tol = 1e-7;

// ---------- 3. Interseccion de cada par de rectas ----------
mprintf("------------------------------------------------------\n");
mprintf("   PUNTOS DE INTERSECCION (candidatos)\n");
mprintf("------------------------------------------------------\n");
vertices = [];
for i = 1:m-1
    for j = i+1:m
        M = [L(i,1) L(i,2); L(j,1) L(j,2)];
        if abs(det(M)) > tol then            // rectas no paralelas
            p = M \ [L(i,3); L(j,3)];
            x1 = p(1); x2 = p(2);
            factible = (x1 >= -tol) & (x2 >= -tol);
            for k = 1:size(A,1)
                if A(k,1)*x1 + A(k,2)*x2 > b(k) + tol then
                    factible = %f;
                end
            end
            estado = "NO factible";
            if factible then estado = "FACTIBLE"; end
            mprintf("  (%6.2f , %6.2f)   %s\n", x1, x2, estado);
            if factible then vertices = [vertices; x1 x2]; end
        end
    end
end
vertices = unique(round(vertices*1e4)/1e4, "r");   // quitar duplicados

// ---------- 4. Evaluar Z en cada vertice factible ----------
mprintf("\n------------------------------------------------------\n");
mprintf("   VERTICES FACTIBLES  ->  Z = 5X1 + 2X2\n");
mprintf("------------------------------------------------------\n");
Zval = [];
for i = 1:size(vertices,1)
    z = c(1)*vertices(i,1) + c(2)*vertices(i,2);
    Zval = [Zval; z];
    mprintf("  (%6.2f , %6.2f)   Z = %8.2f\n", vertices(i,1), vertices(i,2), z);
end

// ---------- 5. Solucion optima ----------
[Zopt, idx] = max(Zval);
xopt = vertices(idx, :);
mprintf("\n======================================================\n");
mprintf("   SOLUCION OPTIMA\n");
mprintf("======================================================\n");
mprintf("  X1 = %g pizzas gigantes\n", xopt(1));
mprintf("  X2 = %g pizzas personales\n", xopt(2));
mprintf("  Z* = $%g de ganancia diaria\n\n", Zopt);

// ---------- 6. Uso de recursos y holguras ----------
mprintf("------------------------------------------------------\n");
mprintf("   USO DE RECURSOS\n");
mprintf("------------------------------------------------------\n");
for i = 1:size(A,1)
    usado = A(i,1)*xopt(1) + A(i,2)*xopt(2);
    holg  = b(i) - usado;
    if holg <= tol then
        mprintf("  %-7s: usado %6.2f de %g   -> ACTIVA (agotado)\n", nombres(i), usado, b(i));
    else
        mprintf("  %-7s: usado %6.2f de %g   -> holgura = %g\n", nombres(i), usado, b(i), holg);
    end
end

// ---------- 7. Comprobacion por dualidad (precios sombra) ----------
mprintf("\n------------------------------------------------------\n");
mprintf("   PRECIOS SOMBRA Y COMPROBACION POR DUALIDAD\n");
mprintf("------------------------------------------------------\n");
activas = [];
for i = 1:size(A,1)
    if abs(A(i,1)*xopt(1) + A(i,2)*xopt(2) - b(i)) < 1e-6 then
        activas = [activas; i];
    end
end
Aact = A(activas, :);
y = Aact' \ c';                 // resolver A_activas' * y = c
yfull = zeros(size(A,1),1);
yfull(activas) = y;
for i = 1:size(A,1)
    mprintf("  Precio sombra %-7s = $%.2f\n", nombres(i), yfull(i));
end
Zdual = b' * yfull;
mprintf("  Valor del dual (sum b_i*y_i) = $%.2f\n", Zdual);
if abs(Zdual - Zopt) < 1e-6 then
    mprintf("  -> Coincide con Z* primal: SOLUCION VERIFICADA\n");
end

// =====================================================================
//  9. GRAFICA
// =====================================================================
x = linspace(0, 35, 400);
masa   = (b(1) - A(1,1)*x) / A(1,2);
queso  = (b(2) - A(2,1)*x) / A(2,2);
tiempo = (b(3) - A(3,1)*x) / A(3,2);

// Region factible sombreada (vertices ordenados por angulo)
vx = vertices(:,1); vy = vertices(:,2);
ang = atan(vy - mean(vy), vx - mean(vx));
[sang, ord] = gsort(ang, "g", "i");
xfpoly(vx(ord)', vy(ord)');
pf = gce(); pf.background = color(205,230,247); pf.line_mode = "off";

plot(x, masa,   "b-");   h1 = gce();
plot(x, queso,  "r-");   h2 = gce();
plot(x, tiempo, "g--");  h3 = gce();
plot(x, (Zopt - c(1)*x)/c(2), "m:");  h4 = gce();
legend([h1 h2 h3 h4], ["Masa"; "Queso"; "Tiempo (redundante)"; "Z = "+string(Zopt)]);

plot(xopt(1), xopt(2), "ko");
xstring(xopt(1)+1, xopt(2)+2, "Optimo ("+string(xopt(1))+","+string(xopt(2))+")  Z=$"+string(Zopt));

a = gca(); a.data_bounds = [0,0; 35,65];
xgrid();
xtitle("Metodo Grafico - Pizzeria M y M", "X1 = Pizzas Gigantes / dia", "X2 = Pizzas Personales / dia");
