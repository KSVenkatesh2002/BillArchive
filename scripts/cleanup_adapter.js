const fs = require('fs');

let content = fs.readFileSync('src/lib/db/mongoAdapter.js', 'utf8');

// 1. Remove imports
content = content.replace("import Source from './models/Source';\n", "");
content = content.replace("import TypeOfWork from './models/TypeOfWork';\n", "");

// 2. Remove getSources and getTypesOfWork
content = content.replace(/async getSources\(\) \{[\s\S]*?\},/, "async getSources() {\n    return []; // Handled by dynamic fields config\n  },");
content = content.replace(/async getTypesOfWork\(\) \{[\s\S]*?\},/, "async getTypesOfWork() {\n    return []; // Handled by dynamic fields config\n  },");

// 3. Update findTasks query parsing
content = content.replace(/\/\/ Source filter[\s\S]*?\/\/ Dynamic custom fields filters/, `    // Dynamic fields filters
    Object.keys(query).forEach(key => {
      if (key !== 'userId' && key !== 'project' && key !== 'createdAt' && query[key] !== 'all') {
        mongoQuery['dynamicValues.' + key] = query[key];
      }
    });
    
    // Fallback cleanup (prevent empty dynamicValues keys)`);

// 4. Clean up findTasks populate
content = content.replace(/\.populate\('userId', 'username name'\)\s*\.populate\('source', 'name'\)\s*\.populate\('typeOfWork', 'name'\)/, ".populate('userId', 'username name')");

// 5. Clean up formattedTasks
content = content.replace(/source: t.source\?.name \|\| \(t.source \? t.source.toString\(\) : ''\),\s*sourceId: t.source\?\._id \? t.source._id.toString\(\) : \(t.source \? t.source.toString\(\) : ''\),\s*typeOfWork: t.typeOfWork\?.name \|\| \(t.typeOfWork \? t.typeOfWork.toString\(\) : ''\),\s*typeOfWorkId: t.typeOfWork\?\._id \? t.typeOfWork._id.toString\(\) : \(t.typeOfWork \? t.typeOfWork.toString\(\) : ''\)/, `source: t.dynamicValues?.source || '',
      typeOfWork: t.dynamicValues?.typeOfWork || ''`);

// 6. Update createTask logic (remove source/type lookup)
content = content.replace(/let sourceId = taskDoc.source;[\s\S]*?taskDoc.typeOfWork = typeId;\s*\}/, "");

// 7. Update updateTask logic (remove source/type lookup)
content = content.replace(/if \(updateDoc\.\$set\.source\) \{[\s\S]*?updateDoc\.\$set\.typeOfWork = typeId;\s*\}/, "");

fs.writeFileSync('src/lib/db/mongoAdapter.js', content);
console.log('Cleanup script executed successfully.');
