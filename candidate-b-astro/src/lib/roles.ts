import { readFileSync } from "node:fs"; //берем одну функцию из встроенного модуля файловой системы 
import { resolve } from "node:path";

export const ROLES_FILE = resolve(process.cwd(), "data", "roles.json");//process.cwd() это папка, из которой сейчас запущена команда
/*const объявляет константу, значение которой нельзя переприсвоить,
 export делает ее доступной снаружи
 new, URL(относительный , базовый) - строит полную ссылку: берет import.meta.url как основу и применяет к ней относительный путь*/

export interface Role {
    slug: string;
    title: string;
    department: string;
    location: string;
}

export type RolesSourceStatus = "ok" | "malformed" | "unavailable";

export interface RolesResult {
    status: RolesSourceStatus;
    roles: Role[];
    problems: string[];
}

export type RoleValidation = //type это второй способ объявить тип и в отличие от interface, он может описывать не только объекты.
    | {ok: true; role: Role} //вертикальная черта - разделитель вариантов объединения(либо то, либо это). Ведущая черта перед первым вариантом нужна 
    | {ok: false; error: string}; // только для читаемости 

function isPlainObject(value: unknown): value is Record <string, unknown>{ /* из-за того , что здесь есть type predicate, а именно - value 
    is Record <string, unknown>, он сообщает TypeScript: Если эта функция вернула true, 
    можешь дальше считать value значением типа Record<string, unknown>. Читаем как - объект, у которого ключи - строки, а значения 
    пока что неизвЕстно какого типа*/
    return typeof value === "object" && value != null && !Array.isArray(value);// проверка на null из-за особенности TypeScript, потому что там 
    //null - это тоже объект , поэтому мы проверяем еще и на то, чтобы не равно было нулю 
    //мы исключаем массив потому что массив технически тоже является объектом 
}

function isNonEmptyString(value: unknown): value is string{
    return typeof value === "string" && value.trim().length > 0; //проверка что строка не пустая и не из одних пробелов
}
/*Превращает что угодно в читаемый текст. Нужна из-за того, что в catch тип unknown */
function describeError(error: unknown): string{
    return error instanceof Error ? error.message : String(error);
}//Тернарный оператор: условие, затем значение при true, затем при false
/*Короткая форма if-else в виде выражения. error.message - текст ошибки, 
доступен только после проверки instanceof. String(error) - безопасное 
превращение в строку для случая, когда брошено не Error
 */
export function validateRole(input: unknown, index: number): RoleValidation{
    if(!isPlainObject(input)){
        return { ok: false, error: `role #${index}: expected a JSON object` };
    }
    const { slug, title, department, location } = input;
    if(!isNonEmptyString(slug)){
        return{ ok: false, error: `role #${index}: "slug" must be a non-empty string`};
    }
    if(!isNonEmptyString(title)){
        return {ok: false, error: `role "${slug}": "title" must be a non-empty string`};
    }
    if(!isNonEmptyString(department)){
        return {ok: false, error: `role "${slug}": "department" must be a non-empty string`};
    }
    if(!isNonEmptyString(location)){
        return {ok: false, error: `role "${slug}": "location" must be a non-empty string`};
    }

    return {
    ok: true,
    role: { slug, title, department, location },
    };
}

export function loadRoles(filePath: string = ROLES_FILE): RolesResult{
    /*Если аргумент не передали будет использоваться ROLES_FILE, 
    это понадобится в тестах, они будут передавать путь к тестовому файлу*/
    let fileContents: string;
    try{
        fileContents = readFileSync(filePath, "utf-8");
    }catch(error){
        return {
            status: "unavailable", 
            roles: [],
            problems: [`cannot read ${filePath}: ${describeError(error)}`],
        };
    }
    let parsed: unknown; 
    try{
        parsed = JSON.parse(fileContents);
    }catch(error){
        return{
            status: "malformed",
            roles: [],
            problems: [`${filePath}: ${describeError(error)}`],
        };
    }
    if(!Array.isArray(parsed)){
        /*Документ валиден , но это не массив , значит, документ не тот, что 
        мы ожидаем */
        return{
            status: "malformed",
            roles: [],
            problems: [`${filePath} must contain a JSON array of roles`],
        };
    }
    const roles: Role[] = [];
    const problems: string[] = [];

    parsed.forEach((item, index) => {//проходим по всем записям 
        const result = validateRole(item, index);
        if(result.ok){
            roles.push(result.role); // добавление элемента в конец массива
        }else{
            problems.push(result.error);
        }
    });
    return {status: "ok", roles, problems};
}
/*Функция принимает список ролей, а не читает файл сама, значит, ее можно 
тестировать без файловой системы */
export function findRoleBySlug(roles: Role[], slug: string): Role | undefined{
    return roles.find((role) => role.slug === slug);
}

