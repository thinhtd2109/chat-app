import randomstring from "randomstring";
export class Helpers {
    static toLowerCase(str: string) {
        return str.toLowerCase();
    }
    static generateRandomInteger() {
        return randomstring.generate({
            charset: 'numeric',
            length: 12
        })
    }
}