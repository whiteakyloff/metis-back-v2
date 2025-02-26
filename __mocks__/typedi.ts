export const Service = () => (target: any) => target;
export const Inject = () => (target: any, _key: string) => target;
export const Container = {
    get: jest.fn()
};