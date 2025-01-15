function isparimp(number) {
    if (number%2==0) {
        return "par"
    } else {
        return "impar"
    }
}


//somar numeros até 1000
function somar(number1=0, number2) {
    const resultado_soma = number1 + number2;
    if (resultado_soma > 1000) {
        return "Nao foi possivel somar os valores, pois o resultado é maior que 1000!";
    } else {
        return "resultado da soma:" + resultado_soma;
    }
   
}

const resultado = isparimp(9);
const n1 = 100;
const n2 = 672;
const result = somar(n1)





/*
let time = 0;

do {
    console.log("Olá, mundo!", time)
    time++
} while (time <= 1012 ) 
*/

function repetir(conteudo, vezes) {
    let time = 0;

      while (time <= vezes ) {
          console.log(conteudo, time)
         time++
    } 
}

/*repetir("Olá, mundo 2.0!", 10);*/


function repeticar_para(param, vezes) {
    for(let c = 0; c <= vezes; c++) {
        console.log(`Repeticao numero: ${c} ${param}`)
      }
}


/*repeticar_para("Ola, mundo 4.0!", 100)*/


//VECTORS
/*
for(let c=0; c<elements.length; c++) {
        console.log(elements[c])
        
    }
 */

function vector() {
    let elements = [9, 3, 2, 7, 9,3,2];
    elements.sort();
    for(let c=0; c<1; c++) {
        console.log(elements)
        console.log(elements.indexOf(7))
    }
       
    
    
}

vector();