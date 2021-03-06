(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Utils_1 = require("./Utils");
    exports.langConfigs = {
        cpp: {
            stdlibFn: "one.hpp",
            request: {
                lang: "CPP",
                code: Utils_1.deindent(`
                #include <iostream>
                    
                class TestClass {
                    public:
                    void testMethod() {
                        std::cout << "Hello World!\\n";
                    }
                };
                
                int main()
                {
                    TestClass c;
                    c.testMethod();
                    return 0;
                }`)
            }
        },
        csharp: {
            stdlibFn: "one.cs",
            request: {
                lang: "CSharp",
                code: Utils_1.deindent(`
                using System;
                
                public class TestClass
                {
                    public void TestMethod()
                    {
                        Console.WriteLine("Hello World!");
                    }
                }
                
                public class HelloWorld
                {
                    static public void Main()
                    {
                        new TestClass().TestMethod();
                    }
                }`)
            }
        },
        go: {
            stdlibFn: "one.go",
            request: {
                lang: "Go",
                code: Utils_1.deindent(`
                package main
                
                import "fmt"
                
                type testClass struct {
                }
                
                func (this *testClass) testMethod() {
                    fmt.Println("Hello World!")
                }
                
                func main() {
                    c := (testClass{})
                    c.testMethod()
                }`)
            }
        },
        java: {
            stdlibFn: "one.java",
            request: {
                lang: "Java",
                code: Utils_1.deindent(`
                public class TestClass {
                    public String testMethod() {
                        return "Hello World!";
                    }
                }`),
                className: 'Program',
                methodName: 'main'
            }
        },
        javascript: {
            stdlibFn: "one.js",
            request: {
                lang: "JavaScript",
                code: Utils_1.deindent(`
                class TestClass {
                    testMethod() {
                        return "Hello World!";
                    }
                }
                
                new TestClass().testMethod()`),
                className: 'TestClass',
                methodName: 'testMethod'
            },
        },
        perl: {
            stdlibFn: "one.pl",
            request: {
                lang: "Perl",
                code: Utils_1.deindent(`
                use strict;
                use warnings;
                
                package TestClass;
                sub new
                {
                    my $class = shift;
                    my $self = {};
                    bless $self, $class;
                    return $self;
                }
                
                sub testMethod {
                    print "Hello World!\\n";
                }
                
                package Program;
                my $c = new TestClass();
                $c->testMethod()`)
            }
        },
        php: {
            stdlibFn: "one.php",
            request: {
                lang: "PHP",
                code: Utils_1.deindent(`
                <?php
                
                class TestClass {
                    function testMethod() {
                        return "Hello World!";
                    }
                }`),
                className: 'TestClass',
                methodName: 'testMethod'
            }
        },
        python: {
            stdlibFn: "one.py",
            request: {
                lang: "Python",
                className: 'TestClass',
                methodName: 'test_method',
                code: Utils_1.deindent(`
                class TestClass:
                    def test_method(self):
                        return  "Hello World!"`)
            }
        },
        ruby: {
            stdlibFn: "one.rb",
            request: {
                lang: "Ruby",
                className: 'TestClass',
                methodName: 'test_method',
                code: Utils_1.deindent(`
                class TestClass
                    def test_method
                        return "Hello World!"
                    end
                end`)
            }
        },
        swift: {
            stdlibFn: "one.swift",
            request: {
                lang: "Swift",
                code: Utils_1.deindent(`
                class TestClass {
                    func testMethod() {
                        print("Hello World!")
                    }
                }
                
                TestClass().testMethod()`)
            }
        },
        typescript: {
            stdlibFn: "one.ts",
            request: {
                lang: "TypeScript",
                className: 'TestClass',
                methodName: 'testMethod',
                code: Utils_1.deindent(`
                class TestClass {
                    testMethod() {
                        return "Hello World!";
                    }
                }
                
                new TestClass().testMethod()`),
            },
        },
    };
    for (const langName of Object.keys(exports.langConfigs))
        exports.langConfigs[langName].name = langName;
});
//# sourceMappingURL=LangConfigs.js.map