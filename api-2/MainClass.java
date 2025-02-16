// import java.net.http.HttpClient;
// import java.net.http.HttpResponse;

public class MainClass {

    public static void ApiTest() {

        try {
          

        } catch (Exception e) {
            // TODO: handle exception
            System.out.println(e);
        }

    }

    public static void main(String[] args) {
        int conditional = 1;
        
        switch (conditional) {
            case 0:
                System.out.println("O valor é igual a 0");
                break;
        
            default:
                System.out.println("O valor é diferente de 0");
                break;
        }


        // String[] array_list = {"jose", "maria"};
        // int[] array_number = {929,22,321};
        // System.out.println(array_list[1].);
        // System.out.println(array_number[0]);
        // String text = "Olá, mundo";
        // int number = 12;

        // ApiTest();

        // System.out.println(number);
        // SumNumber(number, 2);
        // System.out.println(factorialOf(5));
        // System.out.println(changeStringValue(text));
    }

    static void SumNumber(int a, int b) {
        int res = a + b;
        System.out.println(res);
    }

    static long factorialOf(int n) {
        long result = 1;

        for (int i = 2; i <= n; i++) {
            result *= i;

        }
        return result;
    }

    static String changeStringValue(String name) {
        String change_name = "jose";

        for (int i = 0; i <= 4; i++) {
            if (i == 1) {
                change_name = "paulo";
            }
        }
        return change_name;
    }

}