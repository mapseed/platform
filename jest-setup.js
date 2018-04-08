import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import "raf/polyfill";

Enzyme.configure({ adapter: new Adapter() });
