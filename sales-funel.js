document.addEventListener('DOMContentLoaded', function() {
    jsPlumb.ready(function() {
        // Defina as configurações padrão para as conexões (setas)
        jsPlumb.importDefaults({
            Connector: ["Straight"], // Tipo da seta (reta)
            Anchors: ["Right", "Left"], // Ponto de conexão (direita para a esquerda)
            PaintStyle: { stroke: "green", strokeWidth: 2 }, // Estilo da seta
            Endpoint: ["Dot", { radius: 2 }],
        });

        // Conecte os blocos do funil
        jsPlumb.connect({
            source: "step1", // Bloco de origem
            target: "step2", // Bloco de destino
        });

        jsPlumb.connect({
            source: "step2",
            target: "step3",
        });

        // Habilita a movimentação dos blocos
        jsPlumb.draggable("step1");
        jsPlumb.draggable("step2");
        jsPlumb.draggable("step3");
    });
});
