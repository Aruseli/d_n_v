#!/usr/bin/env node

const { Project } = require('ts-morph');
const path = require('path');
const fs = require('fs');

// Получаем аргументы командной строки
const args = process.argv.slice(2);
const command = args[0];

// Инициализируем проект
const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

// Добавляем все TypeScript и TSX файлы в проект
const sourceFiles = [
  ...globSync('app/**/*.{ts,tsx}'),
  ...globSync('components/**/*.{ts,tsx}'),
  ...globSync('lib/**/*.{ts,tsx}'),
  ...globSync('pages/**/*.{ts,tsx}'),
  ...globSync('utils/**/*.{ts,tsx}'),
];

sourceFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    project.addSourceFileAtPath(filePath);
  }
});

// Функция для глобального поиска файлов
function globSync(pattern) {
  const glob = require('glob');
  return glob.sync(pattern, { ignore: 'node_modules/**' });
}

// Функция для переименования компонента
function renameComponent(filePath, oldName, newName) {
  console.log(`Переименование компонента ${oldName} в ${newName} в файле ${filePath}`);

  // Добавляем файл в проект, если его еще нет
  if (!project.getSourceFile(filePath)) {
    project.addSourceFileAtPath(filePath);
  }

  const sourceFile = project.getSourceFileOrThrow(filePath);

  // Ищем объявление компонента
  let componentNode = null;

  // Проверяем функциональные компоненты
  const functionDeclaration = sourceFile.getFunction(oldName);
  if (functionDeclaration) {
    componentNode = functionDeclaration;
  }

  // Проверяем компоненты, объявленные как переменные
  if (!componentNode) {
    const variableDeclaration = sourceFile.getVariableDeclaration(oldName);
    if (variableDeclaration) {
      componentNode = variableDeclaration;
    }
  }

  // Проверяем компоненты, объявленные как классы
  if (!componentNode) {
    const classDeclaration = sourceFile.getClass(oldName);
    if (classDeclaration) {
      componentNode = classDeclaration;
    }
  }

  if (!componentNode) {
    console.error(`Компонент ${oldName} не найден в файле ${filePath}`);
    return false;
  }

  // Переименовываем компонент
  componentNode.rename(newName);

  // Сохраняем изменения
  sourceFile.save();

  console.log(`Компонент ${oldName} успешно переименован в ${newName}`);
  return true;
}

// Функция для переименования файла с обновлением импортов
function renameFile(oldPath, newPath) {
  console.log(`Переименование файла ${oldPath} в ${newPath}`);

  if (!fs.existsSync(oldPath)) {
    console.error(`Файл ${oldPath} не существует`);
    return false;
  }

  if (fs.existsSync(newPath)) {
    console.error(`Файл ${newPath} уже существует`);
    return false;
  }

  // Добавляем файл в проект, если его еще нет
  if (!project.getSourceFile(oldPath)) {
    project.addSourceFileAtPath(oldPath);
  }

  const sourceFile = project.getSourceFileOrThrow(oldPath);

  // Переименовываем файл
  sourceFile.move(newPath);

  // Сохраняем изменения
  project.save();

  console.log(`Файл ${oldPath} успешно переименован в ${newPath}`);
  return true;
}

// Функция для извлечения компонента в отдельный файл
function extractComponent(filePath, componentName, startLine, endLine, newFilePath) {
  console.log(`Извлечение компонента ${componentName} из файла ${filePath} в файл ${newFilePath}`);

  // Добавляем файл в проект, если его еще нет
  if (!project.getSourceFile(filePath)) {
    project.addSourceFileAtPath(filePath);
  }

  const sourceFile = project.getSourceFileOrThrow(filePath);

  // Получаем текст компонента
  const fileText = sourceFile.getFullText();
  const lines = fileText.split('\n');
  const componentText = lines.slice(startLine - 1, endLine).join('\n');

  // Создаем новый файл
  const directory = path.dirname(newFilePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Определяем импорты, которые нужно добавить в новый файл
  const importDeclarations = sourceFile.getImportDeclarations();
  const importStatements = importDeclarations
    .map(importDecl => importDecl.getFullText())
    .join('\n');

  // Создаем содержимое нового файла
  const newFileContent = `${importStatements}\n\n${componentText}\n`;

  // Записываем новый файл
  fs.writeFileSync(newFilePath, newFileContent);

  // Добавляем новый файл в проект
  project.addSourceFileAtPath(newFilePath);

  // Добавляем импорт в исходный файл
  const relativePath = path
    .relative(path.dirname(filePath), newFilePath)
    .replace(/\\/g, '/') // Для Windows
    .replace(/\.tsx?$/, ''); // Удаляем расширение

  sourceFile.addImportDeclaration({
    namedImports: [componentName],
    moduleSpecifier: `./${relativePath}`,
  });

  // Удаляем компонент из исходного файла
  const componentLines = lines.slice(0, startLine - 1).concat(lines.slice(endLine));
  fs.writeFileSync(filePath, componentLines.join('\n'));

  // Обновляем исходный файл в проекте
  project.addSourceFileAtPath(filePath);

  // Сохраняем изменения
  project.save();

  console.log(`Компонент ${componentName} успешно извлечен в файл ${newFilePath}`);
  return true;
}

// Функция для поиска всех использований компонента
function findUsages(componentName) {
  console.log(`Поиск использований компонента ${componentName}`);

  const usages = [];

  // Перебираем все файлы в проекте
  project.getSourceFiles().forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();

    // Ищем импорты компонента
    const importDeclarations = sourceFile.getImportDeclarations();
    for (const importDecl of importDeclarations) {
      const namedImports = importDecl.getNamedImports();
      for (const namedImport of namedImports) {
        if (namedImport.getName() === componentName) {
          usages.push({
            type: 'import',
            file: filePath,
            line: namedImport.getStartLineNumber(),
            text: importDecl.getFullText().trim(),
          });
        }
      }
    }

    // Ищем использования компонента в JSX
    const jsxElements = sourceFile.getDescendantsOfKind(
      project.getLanguageService().getSyntaxKind().JsxOpeningElement
    );
    for (const jsxElement of jsxElements) {
      const tagName = jsxElement.getTagNameNode().getText();
      if (tagName === componentName) {
        usages.push({
          type: 'jsx',
          file: filePath,
          line: jsxElement.getStartLineNumber(),
          text: jsxElement.getParent().getFullText().trim(),
        });
      }
    }
  });

  // Выводим результаты
  if (usages.length === 0) {
    console.log(`Использований компонента ${componentName} не найдено`);
  } else {
    console.log(`Найдено ${usages.length} использований компонента ${componentName}:`);
    usages.forEach(usage => {
      console.log(`- ${usage.file}:${usage.line} (${usage.type})`);
      console.log(
        `  ${usage.text.split('\n')[0]}${usage.text.split('\n').length > 1 ? '...' : ''}`
      );
    });
  }

  return usages;
}

// Обработка команд
switch (command) {
  case 'rename-component':
    if (args.length < 4) {
      console.error(
        'Использование: npm run refactor rename-component <путь-к-файлу> <старое-имя> <новое-имя>'
      );
      process.exit(1);
    }
    renameComponent(args[1], args[2], args[3]);
    break;

  case 'rename-file':
    if (args.length < 3) {
      console.error('Использование: npm run refactor rename-file <старый-путь> <новый-путь>');
      process.exit(1);
    }
    renameFile(args[1], args[2]);
    break;

  case 'extract-component':
    if (args.length < 6) {
      console.error(
        'Использование: npm run refactor extract-component <путь-к-файлу> <имя-компонента> <начальная-строка> <конечная-строка> <новый-путь>'
      );
      process.exit(1);
    }
    extractComponent(args[1], args[2], parseInt(args[3]), parseInt(args[4]), args[5]);
    break;

  case 'find-usages':
    if (args.length < 2) {
      console.error('Использование: npm run refactor find-usages <имя-компонента>');
      process.exit(1);
    }
    findUsages(args[1]);
    break;

  default:
    console.error(`Неизвестная команда: ${command}`);
    console.error('Доступные команды:');
    console.error('  rename-component <путь-к-файлу> <старое-имя> <новое-имя>');
    console.error('  rename-file <старый-путь> <новый-путь>');
    console.error(
      '  extract-component <путь-к-файлу> <имя-компонента> <начальная-строка> <конечная-строка> <новый-путь>'
    );
    console.error('  find-usages <имя-компонента>');
    process.exit(1);
}
